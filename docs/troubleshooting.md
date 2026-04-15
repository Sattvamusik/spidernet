# Troubleshooting

## App does not start
- Confirm you are in `/home/sattv/projects/spidernet-control-deck`.
- Confirm dependencies are installed with `npm install`.
- Check whether port 3000 is already in use.
- Run `npm run build` to catch type or import issues outside dev mode.

## Runtime storage is missing
- Start the app once with `npm run dev`.
- Check `artifacts/runtime/spidernet`.
- If files are missing, verify the repo is writable.

## Lint or build fails
- Run `npm run lint`.
- Run `npm run build`.
- Check for invalid imports between client components and server-only modules.
- Check the packet and registry types first if the failure comes from the architecture layer.

## A board shows the wrong role
- Check `src/lib/spidernet/architecture.ts` for board purpose locks.
- Check `src/lib/spidernet/policy.ts` for the routing rules.
- Check `artifacts/runtime/spidernet/packets/intake.json` for packet classifications and route families.

## Ollama looks inactive
- Current status is expected to be `prepared`.
- A live handshake is not claimed until a real local endpoint is configured and verified.
- Update `artifacts/runtime/spidernet/config/ollama.json` only when you are ready to wire the local model.
