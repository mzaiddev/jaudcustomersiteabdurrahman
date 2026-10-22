"use client";

import "leaflet/dist/leaflet.css";
import type { Circle, Map as LeafletMap, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { FlowNotice, useFlow } from "./flow-ui";
import { findLocation } from "./mock-data";
import { distanceKm, isShortMapLink, parseMapLink } from "./rules";
import type { LocationId } from "./types";

export type MapPoint = { lat: number; lng: number };
export type AddressGuess = { district?: string; street?: string };

/** The official Google Maps "search" link for a point. It opens the pin in the app or the website. */
export function googleMapsLink(point: MapPoint) {
  return `https://www.google.com/maps/search/?api=1&query=${point.lat.toFixed(6)},${point.lng.toFixed(6)}`;
}

/** District and street for a point, from OpenStreetMap's free reverse geocoder. Best effort only. */
async function lookupAddress(point: MapPoint, language: "ar" | "en", signal: AbortSignal): Promise<AddressGuess> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&accept-language=${language}&lat=${point.lat}&lon=${point.lng}`;
  const response = await fetch(url, { signal });
  if (!response.ok) return {};
  const data = (await response.json()) as { address?: Record<string, string> };
  const a = data.address ?? {};
  return {
    district: a.suburb || a.neighbourhood || a.quarter || a.city_district || a.village || undefined,
    street: a.road || a.pedestrian || a.residential || undefined,
  };
}

/**
 * Visit location picker. The customer taps the map, drags the pin, uses the device location, or pastes a
 * Google Maps link (short share links too). Whatever they do, the link below always shows the Google Maps
 * link for the pin, and the district / street fields are filled in from it (until the customer types their own).
 * Leaflet only runs in the browser, so it is imported inside the effect. Tiles are OpenStreetMap (no API key).
 */
export function MapPicker({
  locationId,
  value,
  onChange,
  fields,
  onAddress,
}: {
  locationId: LocationId;
  value: MapPoint | null;
  onChange: (point: MapPoint) => void;
  /** Current district / street typed in the form, so a guess never overwrites the customer's own words. */
  fields?: AddressGuess;
  onAddress?: (guess: AddressGuess) => void;
}) {
  const { t, language } = useFlow();
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const circle = useRef<Circle | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const [ready, setReady] = useState(false);

  const [text, setText] = useState(() => (value ? googleMapsLink(value) : ""));
  const [linkError, setLinkError] = useState("");
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  // Latest props for use inside Leaflet callbacks and async work.
  const live = useRef({ onChange, onAddress, fields, language });
  useEffect(() => {
    live.current = { onChange, onAddress, fields, language };
  });
  const typing = useRef(false);
  const lastGuess = useRef<AddressGuess>({});
  const lookup = useRef<{ timer?: ReturnType<typeof setTimeout>; abort?: AbortController }>({});
  const resolve = useRef<{ timer?: ReturnType<typeof setTimeout>; abort?: AbortController }>({});

  const area = findLocation(locationId)?.area;
  const outside = Boolean(value && area && distanceKm(area, value) > area.radiusKm);

  /** A point the customer chose (tap, drag, device location, pasted link). */
  function choose(point: MapPoint, fromText = false) {
    typing.current = fromText;
    live.current.onChange(point);
    setLinkError("");
    scheduleAddressLookup(point);
  }

  function scheduleAddressLookup(point: MapPoint) {
    clearTimeout(lookup.current.timer);
    lookup.current.abort?.abort();
    lookup.current.timer = setTimeout(async () => {
      const abort = new AbortController();
      lookup.current.abort = abort;
      try {
        const guess = await lookupAddress(point, live.current.language, abort.signal);
        const fields = live.current.fields ?? {};
        // Fill a field when it is empty or still holds our previous guess; never replace what the customer typed.
        const patch: AddressGuess = {};
        for (const key of ["district", "street"] as const) {
          const current = (fields[key] ?? "").trim();
          if (guess[key] && (!current || current === lastGuess.current[key])) patch[key] = guess[key];
        }
        lastGuess.current = { ...lastGuess.current, ...patch };
        if (patch.district || patch.street) live.current.onAddress?.(patch);
      } catch {
        // Offline or blocked: the customer can type the district and street themselves.
      }
    }, 700);
  }

  // The link box shows the pin's Google Maps link, unless the customer is typing in it.
  useEffect(() => {
    if (typing.current) {
      typing.current = false;
      return;
    }
    setText(value ? googleMapsLink(value) : "");
  }, [value?.lat, value?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const L = await import("leaflet");
      if (cancelled || !box.current || map.current) return;
      leaflet.current = L;
      const start = findLocation(locationId)?.area;
      const center: [number, number] = start ? [start.lat, start.lng] : [24.7136, 46.6753];
      const instance = L.map(box.current, { zoomControl: true, attributionControl: true }).setView(center, 11);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(instance);
      instance.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
      map.current = instance;
      instance.on("click", (event) => choose({ lat: event.latlng.lat, lng: event.latlng.lng }));
      // The map may be created inside a container that is still laying out.
      setTimeout(() => instance.invalidateSize(), 50);
      setReady(true);
    })();
    const timers = lookup.current;
    const resolver = resolve.current;
    return () => {
      cancelled = true;
      clearTimeout(timers.timer);
      timers.abort?.abort();
      clearTimeout(resolver.timer);
      resolver.abort?.abort();
      map.current?.remove();
      map.current = null;
      marker.current = null;
      circle.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Coverage circle and centre follow the city.
  useEffect(() => {
    const L = leaflet.current;
    const instance = map.current;
    if (!L || !instance || !area) return;
    circle.current?.remove();
    circle.current = L.circle([area.lat, area.lng], {
      radius: area.radiusKm * 1000,
      color: "#2c5f2d",
      weight: 1,
      fillOpacity: 0.06,
    }).addTo(instance);
    if (!value) instance.setView([area.lat, area.lng], 11);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, ready]);

  // The pin follows the chosen point.
  useEffect(() => {
    const L = leaflet.current;
    const instance = map.current;
    if (!L || !instance || !value) return;
    if (!marker.current) {
      marker.current = L.marker([value.lat, value.lng], {
        draggable: true,
        icon: L.divIcon({ className: "map-pin", html: "<span></span>", iconSize: [28, 28], iconAnchor: [14, 28] }),
      }).addTo(instance);
      marker.current.on("dragend", () => {
        const at = marker.current!.getLatLng();
        choose({ lat: at.lat, lng: at.lng });
      });
    } else {
      marker.current.setLatLng([value.lat, value.lng]);
    }
    if (!instance.getBounds().contains([value.lat, value.lng])) instance.setView([value.lat, value.lng], 16);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, ready]);

  function readPosition(highAccuracy: boolean): Promise<GeolocationPosition> {
    return new Promise((resolvePosition, reject) =>
      navigator.geolocation.getCurrentPosition(resolvePosition, reject, {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 9000 : 12000,
        maximumAge: 30_000,
      }),
    );
  }

  async function useMyLocation() {
    setGeoError("");
    if (!("geolocation" in navigator)) return setGeoError(t.locationUnsupported);
    if (!window.isSecureContext) return setGeoError(t.locationInsecure);
    setLocating(true);
    try {
      let position: GeolocationPosition;
      try {
        position = await readPosition(true);
      } catch (failure) {
        // GPS can be slow or missing (laptops): try network location before giving up. A refusal is final.
        if ((failure as GeolocationPositionError).code === 1) throw failure;
        position = await readPosition(false);
      }
      const point = { lat: position.coords.latitude, lng: position.coords.longitude };
      choose(point);
      map.current?.setView([point.lat, point.lng], 17);
    } catch (failure) {
      const code = (failure as GeolocationPositionError)?.code;
      setGeoError(code === 1 ? t.locationDenied : code === 3 ? t.locationTimeout : t.locationUnavailable);
    } finally {
      setLocating(false);
    }
  }

  function onLinkInput(next: string) {
    typing.current = true;
    setText(next);
    setLinkError("");
    setResolving(false);
    clearTimeout(resolve.current.timer);
    resolve.current.abort?.abort();
    const value = next.trim();
    if (!value) return;

    const point = parseMapLink(value);
    if (point) {
      choose(point, true);
      map.current?.setView([point.lat, point.lng], 17);
      return;
    }
    if (!isShortMapLink(value)) {
      resolve.current.timer = setTimeout(() => setLinkError(t.mapLinkNoCoords), 600);
      return;
    }

    // A short share link: ask the server to open it and read the point.
    setResolving(true);
    resolve.current.timer = setTimeout(async () => {
      const abort = new AbortController();
      resolve.current.abort = abort;
      try {
        const response = await fetch(`/api/resolve-map?url=${encodeURIComponent(value)}`, { signal: abort.signal });
        const result = (await response.json()) as Partial<MapPoint>;
        if (typeof result.lat === "number" && typeof result.lng === "number") {
          const found = { lat: result.lat, lng: result.lng };
          typing.current = false; // show the clean Google Maps link for the point
          choose(found);
          map.current?.setView([found.lat, found.lng], 17);
        } else {
          setLinkError(t.mapLinkNoCoords);
        }
      } catch (failure) {
        if ((failure as Error).name !== "AbortError") setLinkError(t.mapLinkNoCoords);
      } finally {
        setResolving(false);
      }
    }, 300);
  }

  return (
    <div className="map-picker">
      <div className="map-picker-head">
        <span className="map-picker-title">{t.mapPickTitle}</span>
        <button className="button button-outline map-locate" type="button" onClick={useMyLocation} disabled={locating}>
          {locating ? t.locating : t.useMyLocation}
        </button>
      </div>
      <p className="flow-muted">{t.mapPickHint}</p>
      {geoError && <FlowNotice tone="error">{geoError}</FlowNotice>}
      <div className="map-picker-canvas" ref={box} dir="ltr" />
      {outside && <FlowNotice tone="error">{t.outOfCoverage}</FlowNotice>}
      <label className="map-picker-link">
        <span>{t.locationLinkLabel}</span>
        <input
          value={text}
          onChange={(event) => onLinkInput(event.target.value)}
          onFocus={(event) => event.currentTarget.select()}
          dir="ltr"
          inputMode="url"
          placeholder="https://maps.google.com/…"
          aria-describedby="map-link-help"
        />
      </label>
      <p className="flow-muted map-picker-point" id="map-link-help">
        {resolving
          ? t.resolvingLink
          : linkError
            ? linkError
            : value
              ? t.locationLinkReady
              : t.locationLinkHelp}
        {value && !resolving && !linkError && (
          <>
            {" "}
            <a className="map-open-link" href={googleMapsLink(value)} target="_blank" rel="noopener noreferrer">
              {t.openInMaps}
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false">
                <path
                  d="M9 2h5v5M14 2 7.5 8.5M12 9.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="visually-hidden">{t.opensInNewTab}</span>
            </a>
          </>
        )}
      </p>
    </div>
  );
}
