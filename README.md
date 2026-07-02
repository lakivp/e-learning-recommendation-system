## 🎓 Opis projekta

Cilj aplikacije je da omogući:
- upravljanje obrazovnim sadržajem (kursevi, lekcije, testovi),
- praćenje napretka i aktivnosti korisnika,
- personalizovano preporučivanje kurseva na osnovu sadržaja i interesovanja korisnika.

Sistem je namenjen različitim tipovima korisnika:
- **korisnicima** (polaznicima kurseva),
- **predavačima** (kreiranje i upravljanje sadržajem),
- **administratorima** (upravljanje celokupnim sistemom).

Poseban akcenat stavljen je na sistem za preporuku kurseva, koji koristi *content-based* pristup i semantičku analizu tekstualnih opisa.

---

## 🧠 Sistem za preporuku kurseva

Preporučivanje kurseva zasnovano je na **content-based filtering** pristupu.

- Opisi kurseva i interesovanja korisnika predstavljeni su kao vektori
- Korišćen je **Sentence-Transformers model `all-MiniLM-L6-v2`**
- Sličnost se računa pomoću **cosine similarity**
- Primenjen je prag sličnosti (0.3) radi filtriranja nerelevantnih rezultata

Ovaj pristup omogućava preporuke i u uslovima kada ne postoji veliki broj korisničkih interakcija, što je tipično za manje ili nove platforme.

---

## 🛠️ Tehnologije

### Frontend
- Angular
- TypeScript
- HTML / CSS

### Backend
- .NET (ASP.NET Core Web API)
- MongoDB (NoSQL baza podataka)

### AI modul
- Python
- Sentence-Transformers
- Hugging Face modeli

---

## 🏗️ Arhitektura sistema

Aplikacija je zasnovana na **klijent-server arhitekturi** i sastoji se od:
- frontend klijentske aplikacije,
- backend API servisa,
- posebnog AI servisa za generisanje preporuka.

Ovakav pristup omogućava modularnost, lakše održavanje i buduća proširenja sistema.

---

## 📊 Praćenje aktivnosti i statistika

Sistem evidentira:
- upis korisnika na kurseve,
- završetak lekcija,
- uspešno položene testove.

Na osnovu ovih podataka omogućeni su:
- prikaz procenta završenosti kursa,
- pregled korisničkih aktivnosti kroz vreme,
- statistički i vizuelni prikazi (grafici, heatmap).

---

## 🚀 Mogućnosti daljeg razvoja

- Uvođenje **collaborative filtering** ili hibridnog sistema preporuka
- Naprednija personalizacija puta učenja
- Podrška za višejezične modele
- Skaliranje sistema korišćenjem cloud infrastrukture
- Optimizacija performansi za veći broj korisnika

---

## 📁 Pokretanje projekta (osnovna ideja)

1. Pokrenuti backend (.NET Web API)
2. Pokrenuti frontend (Angular aplikaciju)
3. Pokrenuti AI servis za preporuke
4. Podesiti konekciju sa MongoDB bazom

*(Detaljna uputstva mogu se dodati po potrebi)*

---

## 👤 Autor

Diplomski rad iz oblasti informacionih tehnologija  
Mentor: prof. dr Tatjana Stojanović  

---

## 📄 Licenca

Ovaj projekat je namenjen akademskoj i demonstracionoj upotrebi.
