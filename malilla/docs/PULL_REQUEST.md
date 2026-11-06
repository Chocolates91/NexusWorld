# Add the furnished Malilla apartment viewer with preserved source geometry

The supplied floor-plan HTML mixes architecture, a furniture editor and a basic viewer. Add an independent Three.js application under `malilla/` that preserves the original coordinates, openings, fixed elements and default furnishing layout, with detailed procedural furniture, local 2K PBR maps, architectural lighting, room cameras and walking collisions. Keep the untouched HTML and its editor in `legacy/`; NexusWorld's existing Godot/Python application is unchanged.

High/Ultra profiles, three lighting moods, real planar bathroom mirrors, SSAO and a PNG exporter that checks the actual 3840 × 2160 drawing buffer are included. The implementation documents the source area discrepancy and the remaining gap to professional photorealistic ArchViz, including approximate GI and procedural secondary assets.

Validation: production build, 6 passing source/geometry/asset tests, browser captures of all 12 views and three moods, functional navigation/collision/quality/mobile checks, and an exported PNG confirmed at 3840 × 2160. Browser rendering used SwiftShader, so this does not establish hardware GPU frame rates. See `malilla/docs/QA.md` and its real screenshots.

No public deployment. The GitHub API returned Forbidden in this environment; this file provides the reviewable PR description without claiming a PR was created.
