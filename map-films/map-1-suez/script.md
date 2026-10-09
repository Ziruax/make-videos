# map-1 · "One Ship vs the World" — the Ever Given, Suez 2021

The map-film track's first production (`make-map`). **16:9 1920×1080 documentary format**,
~42 s. The whole film is ONE continuous camera move over a real d3-geo map — tilted like a
tabletop war map, film grain on the map layer only — and every scene hands its camera
anchor to the next.

**The story.** March 2021: the 400-metre container ship Ever Given grounds in the Suez
Canal and blocks one of the world's trade arteries for six days. The queue, the salvage,
and the ships that gave up and sailed around Africa instead.

---

## The facts, verified (2021 Suez Canal obstruction)

| claim | value | source |
|---|---|---|
| blocked | 23–29 March 2021 (6 days) | Wikipedia / SCA |
| the ship | Ever Given, 400 m long, wedged **across** the waterway (bow in the eastern bank) | Wikipedia, widely photographed |
| winds | sandstorm, gusts ~40 knots | contemporary reporting (BBC etc.) |
| trade share | ~12% of global merchandise trade through the canal | widely reported (IMF-based) |
| cost | ~$9.6 bn/day of marine traffic held up | Lloyd's List estimate (FT/Guardian) |
| queue | 369 ships by 28 March ("nearly 370") | Wikipedia; 367 in SCA/Reuters reports |
| salvage | dredgers + tugboats, refloated on a full-moon high tide | Wikipedia ("Dredgers, Tugboats, and a Full Moon") |
| the canal | 193 km long | SCA |

VO only claims these; the chips print them. "Nearly ten billion dollars a day" rounds
$9.6 bn the way a narrator honestly would.

**Scale honesty note:** the geography is real (d3-geo Mercator over Natural Earth 50 m);
the ACTORS (ships, tugs) are drawn oversized for legibility — at true scale a 400 m ship
is 0.016 px on this projection. That is the standard map-film convention; the script's
numbers, never the glyph sizes, carry the facts. The canal itself is drawn as a water
strip along its real course (Port Said → Bitter Lakes → Suez).

---

## The camera route (the film IS this route — one continuous shot)

| anchor | lon, lat | z | what it frames |
|---|---|---|---|
| `canal` | 32.42, 30.55 | 34 | whole canal + both anchorages (HOOK framing) |
| `wide` | 32, 27 | 1 | Europe · Africa · Asia — the trade corridor |
| `ship` | 32.57, 30.00 | 90 | the grounding site, tight |
| `redsea` | 33.4, 27.5 | 6 | canal + Red Sea + the head of the reroute |

Scene handoffs (every scene STARTS on the exact frame the previous ENDS — anchors are
imported, never re-invented):

```
0.0–3.4   HOOK      canal (frame 0: the ship ALREADY wedged, title up)
3.4–7.2   → wide    pull out (the reveal of scale)
7.2–12.6  SETUP     wide, drift; trade arcs draw + dots flow
12.6–16.2 → canal   push back in (approach)
16.2–19.4 GROUND    canal; ship sails down, gust, WEDGE at ~18.3
19.4–20.6 → ship    punch in on the wreck
20.6–22.0 → canal   pull back out (need both anchorages for the queue)
22.0–26.6 QUEUE     canal; queue dots accumulate, counter, chip
26.6–28.2 → ship    in for the salvage
28.2–31.4 SALVAGE   ship; dredger FIGURE-RISES, tugs nudge, moon-tide wash
31.4–33.4 → wide    out for the aftermath
33.4–39.0 REROUTE   wide; Cape arc draws, dots sail the long way
39.0–42.0 END       wide hold; end title
```

## On-screen events per scene

- **HOOK (frame 0 composed):** the Ever Given PNG already diagonal across the canal, red
  aground mark, title "ONE SHIP vs THE WORLD" + subtitle "Suez Canal · March 2021".
- **SETUP:** the Egypt outline self-draws (glow); three trade arcs (Asia→Europe via Suez)
  draw with flowing dots; chip "193 km · dug between two continents".
- **GROUNDING:** the Ever Given travels south down the canal; VfxStreaks gust; she
  rotates ~30° and wedges; dust/impact mark; queue begins at both ends.
- **QUEUE:** dots accumulate at the Med anchorage (N of Port Said) and the Gulf of Suez;
  live counter → 369; chip "$9.6 bn a day".
- **SALVAGE:** a dredger glyph FIGURE-RISES out of the canal bank (the signature move);
  two tugs nose against the hull; a pale "tide" wash pulses along the canal.
- **REROUTE:** the Cape of Good Hope arc self-draws (the long way around Africa), dots
  sail it; the canal route dims. End title: "ONE CANAL · ONE SHIP · SIX DAYS".

## VO (~93 words, 2.7 wps)

| time | VO |
|---|---|
| 0.5–3.0 | "In March 2021, one ship stopped the world." |
| 3.6–6.4 | "Suez: one hundred ninety-three kilometres of water." |
| 6.8–9.8 | "Roughly twelve percent of all world trade sails through it." |
| 10.2–13.6 | "March 23rd. The Ever Given: four hundred metres long." |
| 13.8–16.2 | "A sandstorm slammed her with forty-knot winds." |
| 16.4–18.3 | "She swung sideways, and stuck." |
| 18.5–21.2 | "Behind her, the queue grew. And grew." |
| 21.3–23.4 | "Three hundred and sixty-nine ships, waiting." |
| 23.2–26.2 | "Nine point six billion dollars a day, parked." |
| 26.4–31.4 | "Six days. Dredgers. Tugboats. And a full-moon tide." |
| 31.6–33.4 | "On day six, she floated free." |
| 33.6–35.4 | "But some captains hadn't waited." |
| 35.5–38.4 | "They'd already sailed the long way around Africa." |
| 38.4–41.4 | "One canal. One ship. Six days." |

## Sound (foley sheet)

whoosh on every camera move · riser as the arcs draw · gust whoosh + impact when she
wedges · sonar-ish ping as the queue builds · low boom + tide wash on the refloat ·
soft swell on the Cape reroute · dark tension bed under everything (music bed, optional).

## Production notes

- **The camera never jumps** (the one rule that matters): anchors live in one module
  constant; scene handoffs interpolate from the previous scene's end anchor.
- **Grain on the map layer only** — actors (ship, tugs, chips, title) sit above it.
- Render: `npx remotion render Map1Suez out/Map1Suez.mp4 --gl=angle` (ANGLE renderer,
  per the skill).
- Voice: Edge TTS `en-US-ChristopherNeural` (default — user hasn't named a voice).
- Seeds the **map-film series**: Strait of Hormuz tanker war · the Turkey straits · the
  Panama drought · the Northern Sea Route opening.
