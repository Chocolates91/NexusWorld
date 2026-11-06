# Add the furnished Malilla apartment viewer with preserved source geometry

Add an independent Three.js apartment viewer under `malilla/`, preserving the supplied HTML's coordinates, openings, fixed elements and default furnishing layout. Keep the untouched HTML/editor in `legacy/`; leave NexusWorld's Godot/Python application unchanged. Include detailed procedural furniture, local PBR maps, architectural lighting, 14 room/detail cameras and walking collisions.

Match the main bathroom to the supplied visual references: horizontal white porcelain, wood-effect shower wall, warm-veined floor, integrated rectangular basin and asymmetrical oak vanity on metal feet, skirted WC, thermostatic shower with perforated rain head and square drain. Update built-in wardrobes with white recessed fronts, beige interiors, shelving and rails; one bay opens for inspection with leaf collisions. Preserve fixed dimensions and document inferred details and the room assignment.

Model the entrance references with a white interior door, right-hand satin-steel hinges and hardware, intercom, three access panels, outlets and a shallow ceiling drop with ventilation grille. Replace the generic terrace division with three panes and a walkable central leaf inside the unchanged opening. Retain a local, attributed CC0 vegetation panorama as an illustrative background; adjust daylight direction and fill to show actual frame shadows.

High/Ultra profiles, three lighting moods, actual planar mirror reflections, SSAO and an exporter checking the real 3840 × 2160 drawing buffer are included. Document the area discrepancy, procedural asset provenance and the remaining gap to professional photorealistic ArchViz.

Validation: production build, 11 passing source/geometry/asset/environment tests; initial browser captures across all original views and three moods; targeted reference review of five updated views plus night; actual basin and wardrobe collision checks; exported salon and bathroom PNGs verified at 3840 × 2160. Rendering used SwiftShader, so this does not establish physical GPU frame rates. See `malilla/docs/QA.md`, `REFERENCES.md` and real screenshots.

No public deployment.
