# Rechen-Gipfel

Digitale Lernwelt zu den Grundrechenarten für die **5. Klasse der Mittelschule in Bayern**.
Die Kinder üben Addition, Subtraktion, Multiplikation und Division, jeweils **halbschriftlich** und **schriftlich**, in **Stufe 1** und **Stufe 2**.

## So läuft es für die Kinder

1. **Rechenart wählen:** Addieren, Subtrahieren, Multiplizieren oder Dividieren. Jede Rechenart ist ein eigener Berg.
2. **Verfahren wählen:** halbschriftlich (Rechnen in Schritten) oder schriftlich (untereinander in Rechenkästchen).
3. **Stufe wählen:** Stufe 1 oder Stufe 2.
4. **Üben:** Eine Runde hat 5 Aufgaben. Die 5. Aufgabe ist eine schwerere **Gipfelaufgabe** mit doppelten Punkten. Ab der 2. Hütte kommen **Sachaufgaben** dazu: Die Kinder wählen zuerst die passende Rechnung und rechnen dann.
5. **Aufsteigen:** Wer mindestens 4 von 5 Aufgaben im ersten Versuch löst, erreicht die nächste Hütte. Pro Stufe gibt es 5 Hütten, und mit jeder Hütte werden die Zahlen größer.

Spielerische Elemente sind Punkte, Sterne pro Hütte, Serienbonus, Konfetti und Gamsi, die Gämse, die lobt und Tipps gibt.
Bei einem Fehler gibt es einen zweiten Versuch. Danach zeigt Gamsi die Lösung in Rot und erklärt die Schritte.

## Was in welcher Stufe geübt wird

| Rechenart | Halbschriftlich Stufe 1 | Halbschriftlich Stufe 2 | Schriftlich Stufe 1 | Schriftlich Stufe 2 |
| --- | --- | --- | --- | --- |
| Addition | bis 1 000, Zerlegung vorgegeben | bis 10 000, selbst zerlegen | zwei Zahlen, mit Merkzahlen | drei oder vier Zahlen, bis 100 000 |
| Subtraktion | bis 1 000, Zerlegung vorgegeben | bis 100 000, selbst zerlegen | **bayerisches Verfahren**: abziehen und entbündeln, mit Strich-Zeile | große Zahlen, Nullen im Minuenden, über mehrere Stellen entbündeln |
| Multiplikation | einstelliger Faktor, Zerlegung vorgegeben | größere Zahlen und zweistellige Faktoren, selbst zerlegen | **einstelliger Faktor** | **zweistelliger Faktor** mit Zwischenergebnissen |
| Division | Zerlegung vorgegeben | selbst zerlegen, auch durch zweistellige Zahlen | Schritt für Schritt mit allen Hilfen | weniger Hilfen, mit Rest und großen Zahlen |

Hinweise zu den Verfahren:

- **Subtraktion schriftlich** folgt dem Abziehverfahren mit Entbündeln, wie in Bayern üblich. Die Kinder können unter der entbündelten Stelle einen Strich setzen. Die Erklärtexte lauten zum Beispiel „2 Z − 6 Z geht nicht. Ich entbündele 1 H (|). 12 Z − 6 Z = 6 Z“.
- **Multiplikation mit zweistelligem Faktor:** Erst wird mit den Zehnern gerechnet (mit 0 am Ende), dann mit den Einern, dann wird addiert. Die Schreibweise ohne 0, nach links eingerückt, wird ebenfalls als richtig erkannt.
- **Division schriftlich:** Die Kinder beantworten Schritt für Schritt „Wie oft passt …?“, „… · … =“ und „Wie viel bleibt übrig?“. Das Rechenbild wächst dabei mit.

## Bedienung

Die Lernwelt funktioniert mit Maus, Tastatur und auf dem Tablet. Auf dem Bildschirm gibt es ein Zahlenfeld.
Mit der Tastatur geben die Kinder Ziffern direkt ein, die Pfeiltasten wechseln das Feld, und die Eingabetaste prüft.

Der Fortschritt (Hütten, Sterne, Punkte) wird **nur im Browser des jeweiligen Geräts** gespeichert. Es werden keine Daten an einen Server geschickt, und es gibt keine Anmeldung.

## Veröffentlichen mit GitHub Pages

1. Im Repository auf **Settings → Pages** gehen.
2. Unter **Build and deployment** bei *Source* „Deploy from a branch“ wählen, dann Branch **main** und Ordner **/ (root)**, und speichern.
3. Nach ein bis zwei Minuten ist die Lernwelt unter `https://melinehoegl.github.io/Grundrechenarten5/` erreichbar. Diesen Link können die Kinder öffnen.

Ohne Internet geht es auch: Die Datei `einzeldatei/Rechen-Gipfel.html` enthält die ganze Lernwelt in einer Datei. Sie lässt sich per Doppelklick im Browser öffnen oder auf Tablets kopieren.

## Aufbau des Projekts

```
index.html            Startseite und alle Bildschirme
css/style.css         Gestaltung (hell und dunkel, Handy und Tablet)
js/util.js            Hilfsfunktionen und Speicher
js/generators.js      Aufgaben und Sachaufgaben je Rechenart, Verfahren, Stufe und Hütte
js/specs.js           Aufbau der Übungen, Prüfung, Tipps und Lösungswege
js/widgets.js         Rechenkästchen, Rechnen in Schritten, Division Schritt für Schritt
js/app.js             Ablauf, Punkte, Hütten
einzeldatei/          die ganze Lernwelt als eine HTML-Datei
tools/einzeldatei.py  erzeugt die Einzeldatei neu nach Änderungen
```

Zahlenbereiche ändern: in `js/generators.js`. Sachaufgaben ergänzen: im Abschnitt `SACH` in derselben Datei.
