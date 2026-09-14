# AstroSun

AstroSun is a mobile-first astronomy + astrophysics + Vedic astrology research workspace. It deliberately separates **deterministic astronomy/physics** from **traditional astrological interpretation** instead of presenting astrology as experimentally established physics.

## Architecture
- Vanilla SPA frontend with 120+ data-driven feature routes, splash + four onboarding screens, responsive custom navigation, 2.5D animated cosmic visuals, green/blue/yellow UI and orange actions.
- Node/Express backend with server-side AI routing and NASA adapter endpoints.
- NVIDIA NIM primary provider with automatic AIHubMix failover.
- No authentication in this foundation build.
- Deterministic client-side calculators for Julian Date, Kepler equation and angular separation; production ephemerides should be attached through JPL/NASA/SPICE adapters.

## Render environment
Set:
- `NVIDIA_NIM_API_KEY`
- `NVIDIA_NIM_MODEL`
- `NVIDIA_NIM_BASE_URL` (optional; defaults to `https://integrate.api.nvidia.com/v1`)
- `AIHUBMIX_API_KEY`
- `AIHUBMIX_MODEL`
- `AIHUBMIX_BASE_URL` (recommended: set to the OpenAI-compatible base URL supplied by your AIHubMix account)
- `NASA_API_KEY` (optional; defaults to NASA DEMO_KEY)

The server keeps keys off the browser. NIM uses the OpenAI-compatible `/v1/chat/completions` contract.

## Research basis
The architecture is informed by modern ephemeris-generation and stellar-forcing literature, including Sorcha's high-precision solar-system ephemeris pipeline and recent reviews of radiation, magnetized stellar winds, CMEs and energetic particles. See the research notes in the project issue/README extensions when the literature layer is expanded.
