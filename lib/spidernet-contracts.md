# 🕸 SPIDERNET/VATAYAN — CONTRACTS LIBRARY

## LANE SCOPING
These contracts are consumed per-lane under the parent-spine-with-
cognitive-core topology. Registries are shared; slices are lane-scoped.
Each child lane populates its own slice of the registries without
colliding with sibling lanes. See `docs/architecture/lane-topology.md`
for the topology and `rul/lane-preservation.md` for the enforceable
boundary rules. The attachment model for capabilities is in
`lib/module-attachment.md`.

## EVENT CONTRACT
{
  "id": "evt_*",
  "type": "string",
  "source": "string",
  "created_at": "ISO-8601",
  "payload": {}
}

## PACKET CONTRACT
{
  "id": "pkt_*",
  "type": "intake|research|execution|validation|approval|pass",
  "classification": "string",
  "input": "string",
  "status": "created|queued|running|blocked|done",
  "created_at": "ISO-8601"
}

## LEDGER CONTRACT
{
  "id": "led_*",
  "action": "string",
  "packetId": "string",
  "packetType": "string",
  "created_at": "ISO-8601"
}

## ADAPTER CONTRACT
Each adapter must expose:
- send(task)
- status()
- receive(result)

## STORAGE CONTRACT
Runtime storage readers currently expect:
- intakePackets: array
- researchPackets: array
- executionPackets: array
- validationPackets: array
- approvalPackets: array
- passPackets: array
- wrapperRegistry: array
- skillRegistry: array
- scoreRegistry: array
- ledgerEvents: array
- vaultIndex: object
- ollamaConfig: object
