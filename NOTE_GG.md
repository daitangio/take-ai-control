Modello Copilot/Claude Sonnet 4.6
Ho limitato i crediti a 500, questo ha forzato il sistema ad essere "frugale".
La prima parte di AI-SDLC ha consumato circa 100 crediti.
La parte di backend ne ha consumati altri 100

Ho alzato il limite a 700 crediti perché ha iniziato a dire che doveva essere "estremameente frugale"

La parte dolente inizia quando si fa la code review.
Backend:
- Il codice non compila
- Maven wrapper non installato

Quando gli ho chiesto di sistemare gli errori di compilazione ha iniziato ad allucinare sostenendo che java25 non esiste

> `java.version` is set to `25` - Java 25 doesn't exist (latest is 21/22).

cosa ovviamente falsa.

L'impressione è che l'uso di versioni molto nuove delle librerie lo abbia messo in difficoltà

## Libquibase...
Ha sistemato tutto ma alla mia c'è un aspetto molto delicato: liquibase non supporta sqlite3 granché bene


Sistemato anche quello, costo totale di questo primo setup circa $6.82

L'applicazione java ha diversi problemi, lo schema non è corretto e la struttura è mischiata.

In generale l'uso di Sqlite ha dato molti probelmi, ma l'approccio SDLC non sembra efficace in ogni caso.
Riprovare a rifare da zero