# Architettura del Software e Stack Tecnologico

## 1. Sistema di coordinate e scala metrica 1:1

L'intero motore geometrico di **CameraMia 3D Studio** opera in centimetri (`cm`) nello store applicativo e converte in metri (`1 unità = 100 cm`) all'interno della scena WebGL Three.js:

- **Origine `(0, 0, 0)`**: angolo interno **Nord-Ovest** a livello del pavimento.
- **Asse X (`0 .. 468 cm`)**: corre da Ovest (`X = 0`, parete portafinestra) verso Est (`X = 468 cm`, parete letto/armadi).
- **Asse Y (`0 .. 285 cm`)**: altezza verticale dal pavimento (`Y = 0`) al soffitto (`Y = 285 cm`).
- **Asse Z (`0 .. 424 cm`)**: corre da Nord (`Z = 0`, parete porta d'ingresso) verso Sud (`Z = 424 cm`, parete termosifone/poltrona/Kallax).

---

## 2. Gestione dello stato (`useRoomStore.ts`)

Lo stato globale è gestito con **Zustand** e salvato automaticamente in `localStorage` tramite il middleware `persist` (`cameramia-3d-storage-v1`).

Principali funzionalità esposte dallo store:
- Commutazione immediata tra `activeMode = 'current'`, `activeMode = 'new'` e scenari salvati dall'utente (`savedScenarios`).
- Sincronizzazione bidirezionale tra vista 3D (`RoomScene3D`), pianta 2D (`FloorPlan2D`) e pannello ispettore (`StudioSidebar`).
- Calcolo e impostazione diretta delle 4 distanze dai muri (`north`, `south`, `west`, `east`) tramite `setItemDistanceFromWall`.
- Gestione completa della lista `accessories` per ogni armadio (`addWardrobeAccessory`, `updateWardrobeAccessory`, `removeWardrobeAccessory`) e delle 8 celle dello scaffale Kallax (`updateKallaxCell`).

---

## 3. Rilevamento collisioni e vincoli (`geometry.ts`)

Il modulo `src/utils/geometry.ts` esegue in tempo reale:
1. **`getItemBoundingBox`**: calcolo dell'ingombro 2D sul piano pavimento tenendo conto della rotazione in gradi e della geometria ad L della libreria angolare Billy.
2. **`getOpenClearanceBox`**: calcolo dello spazio aggiuntivo richiesto quando ante battenti (`+46 cm`), cassetti (`+38 cm`), rete contenitore o divano letto (`+115 cm`) vengono aperti.
3. **`analyzeRoomClearances`**: verifica di fuoriuscite dal perimetro murario, superamento dell'altezza del soffitto (`285 cm`) e collisioni tra arredi.
