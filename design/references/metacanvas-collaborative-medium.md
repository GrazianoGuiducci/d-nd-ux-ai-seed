# MetaCanvas Studio 20 — riferimento D-ND Design per un medium collaborativo

Data: 13 novembre 2026.  
Owner del **metodo di design**: D-ND Design Kernel (`GrazianoGuiducci/d-nd-ux-ai-seed`).  
Owner **del prodotto, del codice e dello stato del documento**: K-UX-AI / Collaborative Communication Medium (`GrazianoGuiducci/k-ux-ai`).  
Stato: **esercizio progettuale documentato, tool pubblico verificato in GitHub; non componente distribuito dal package Agentic UX Seed**.

## Artefatto e prova

- [Editor pubblico scaricabile: MetaCanvas Studio 20](https://github.com/GrazianoGuiducci/k-ux-ai/blob/main/examples/collaborative-communication-medium/AI_Collaboration_Studio.html)
- [Istruzioni di utilizzo](https://github.com/GrazianoGuiducci/k-ux-ai/blob/main/examples/collaborative-communication-medium/README.it.md)
- [Contratto JSON e scambio](https://github.com/GrazianoGuiducci/k-ux-ai/blob/main/examples/collaborative-communication-medium/DOCUMENT_CONTRACT.md)
- [Limiti e verifiche](https://github.com/GrazianoGuiducci/k-ux-ai/blob/main/examples/collaborative-communication-medium/SOURCE_AND_SCOPE.md)
- Studio 20: 272.490 byte, SHA-256 `c8c1be74c7d9b91d99b0c7888c40cee387579ca26f3079d0fa44ea81f1817a19`. Pubblicazione K-UX-AI commit `0be329ae723110c62aa67d89756397683505319b`; file riletto da GitHub senza differenze

## Relazione percettiva realmente richiesta

L'operatore ha evidenziato l'ingombro dei pannelli, il limite dei ridimensionamenti e la dispersione dei controlli sotto al canvas, fino a richiedere **più capacità con minore complessità visiva**. La richiesta non era solo di comprimere la toolbar, ma di agevolare il movimento di idee e contributi umani/AI senza farne percepire ogni funzione come un comando concorrente.

In Studio 19 Standard e Flat riuniscono navigazione, zoom, modifica e salvataggio in una fascia meno ingombrante, pur conservando differenti modalità di spazio. Strumenti usa un layout interno responsive; editor e pannelli sono ridimensionabili/spostabili. In Studio 20 la nuova complessità operativa (consegna selettiva all'AI, confronto delle revisioni, recupero) è **nascosta finché non ha un motivo d'uso**.

## Saper fare di Design che questo esercizio rende operativo

- **Gerarchia percettiva:** il canvas, non la collezione dei comandi, è il referente dominante. La sidebar mantiene la sequenza e gli strumenti appaiono per editare, non per occupare permanentemente lo spazio.
- **Responsive significativo:** non ridurre soltanto la scala. Comporre sulla larghezza *e* sull'altezza disponibili, sulla densità del singolo gruppo e sulla relazione fra pannello e contenuto; su mobile mantenere lettura e accesso, con scorrimento interno dove necessario.
- **Progressive disclosure per effetto:** mostrare l'opzione nello stesso momento in cui può modificare il lavoro: selezione ambito per condividere con l'AI, differenze prima di integrare, recupero quando viene richiesto. Non ogni nuova funzione richiede un nuovo pulsante visibile nella vista principale.
- **Continuità del focus:** spostare o espandere l'editor non deve fare perdere il referente selezionato; apertura/chiusura, drag, resize, undo e layout non devono confondere salvataggio del documento con geometria dei controlli.
- **Significato conservato nella trasformazione:** frecce, note, identificatori e relazioni sono parte dell'oggetto. Un confronto visivo/strutturale serve a leggere una differenza, non a stabilire se una proposta AI è vera. La fusione selettiva salvaguarda note private che non erano state inviate al modello.
- **Verifica incarnata:** uno screenshot misura soltanto la situazione mostrata. Questo caso include controlli locali Node/Chromium su viewport, scambio e persistenza del file; resta non verificata la reale apertura `file://` su Chrome Windows, lo storage locale dell'operatore, touch fisico, screen reader e comprensione dei destinatari.

Questa è una **composizione dell'attuale Interaction Quality e Perceptual Composition**, non una nuova grammatica universale e non la promozione del tool a componente della libreria D-ND UX Seed. I temi, i breakpoint e la forma corrente rimangono decisioni di un artefatto; il saper fare trasferibile è il rapporto tra spazio, referente, intervento ed esito.

## Distingui gli effetti e i prossimi owner

- K-UX-AI conserva codice, licenza MPL-2.0 della directory, document contract, download e future revisioni.
- D-ND Design conserva il contributo di gerarchia, composizione responsiva e controllo del carico percettivo, collegando questa prova come riferimento.
- Editoriali e il proprietario MAIOS.it stabiliranno testi, struttura risorsa, convenzioni e deploy quando Codex sarà effettivamente attivato. La destinazione desiderata è **Risorse → Tool**, non Meta-skill.
- Il sito non è stato pubblicato con questo riferimento; un documento in GitHub non avvia Codex né installa un componente.

Il prossimo progetto può usare lo stesso saper fare con una superficie differente: il numero delle barre, la scelta di layout Flat o un singolo editor HTML non sono la definizione del Design Kernel.
