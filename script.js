// === JavaScript Esterno Unico ===
document.addEventListener('DOMContentLoaded', () => {

    // --- Riferimenti agli Elementi DOM ---
    // Sezione Verifica
    const verifierSection = document.getElementById('verifier-section');
    const foodInput = document.getElementById('food-input');
    const resultDisplay = document.getElementById('result-display');
    const resultIconSpan = document.querySelector('#result-display .result-icon');
    const resultNotesSpan = document.querySelector('#result-display .result-notes');
    const resultCaloriesSpan = document.querySelector('#result-display .result-calories'); // Span per le calorie
    const showSuggestionsLink = document.getElementById('show-suggestions-link');

    // Sezione Consigli
    const suggestionsSection = document.getElementById('suggestions-section');
    const suggestionsOutput = document.getElementById('suggestions-output');
    const mealButtons = document.querySelectorAll('.meal-button');
    const backToVerifierLink = document.getElementById('back-to-verifier-link');
    const placeholderSuggestionText = '<p class="placeholder-text">Seleziona un pasto per visualizzare idee.</p>';

    // --- Variabili Globali per i Dati ---
    let foodData = []; // Verrà popolato dal JSON
    let foodMap = new Map(); // Verrà popolato dopo il caricamento dei dati

    // --- Funzione di Inizializzazione Principale (chiamata dopo il caricamento dei dati) ---
    function initializeApp() {
        // Crea la Mappa per ricerche veloci (ORA che foodData è popolato)
        foodMap = new Map(foodData.map(item => [item.name.toLowerCase(), item]));
        console.log("Food map creata con", foodMap.size, "voci."); // Log di conferma

        // --- Funzioni di Navigazione tra Sezioni ---
        function showSection(sectionToShow) {
            document.querySelectorAll('.page-section').forEach(section => {
                section.classList.remove('active-section');
            });
            if (sectionToShow) {
                sectionToShow.classList.add('active-section');
            }
        }

        // --- Logica Sezione VERIFICA CIBO (Aggiornata per mostrare calorie) ---
        const checkFood = () => {
            // Controllo robusto elementi DOM
            if (!foodInput || !resultDisplay || !resultIconSpan || !resultNotesSpan || !resultCaloriesSpan) {
                console.error("Errore: Elementi del DOM per la verifica (inclusi calorie) mancanti.");
                return;
            }
            const userInput = foodInput.value.trim();

            // Resetta display
            resultIconSpan.textContent = '';
            resultNotesSpan.textContent = '';
            resultCaloriesSpan.textContent = ''; // Resetta calorie
            resultDisplay.classList.remove('show', 'result-ottimo', 'result-buono', 'result-moderato', 'result-scarso', 'result-sconosciuto');

            if (userInput === '') return;
            const userInputLowerCase = userInput.toLowerCase();

            setTimeout(() => { // Leggero ritardo per effetto visivo
                const foodInfo = foodMap.get(userInputLowerCase); // Usa la mappa!

                if (foodInfo) {
                    let icon = '';
                    let ratingClass = '';
                    switch (foodInfo.rating) {
                        case 'ottimo': icon = '⭐'; ratingClass = 'result-ottimo'; break;
                        case 'buono': icon = '👍'; ratingClass = 'result-buono'; break;
                        case 'moderato': icon = '🤔'; ratingClass = 'result-moderato'; break;
                        case 'scarso': icon = '🍃'; ratingClass = 'result-scarso'; break;
                        default: icon = '❓'; ratingClass = 'result-sconosciuto';
                    }
                    resultIconSpan.textContent = icon;
                    resultNotesSpan.textContent = foodInfo.notes || 'Nessuna nota disponibile.';
                    // Mostra calorie se disponibili
                    if (typeof foodInfo.calories === 'number') {
                         resultCaloriesSpan.textContent = `~ ${foodInfo.calories} kcal / 100g`;
                    } else {
                         resultCaloriesSpan.textContent = ''; // Nasconde se non presenti
                    }
                    resultDisplay.classList.add(ratingClass);
                } else {
                    resultIconSpan.textContent = '❓';
                    resultNotesSpan.textContent = 'Cibo non presente nel database.';
                    resultCaloriesSpan.textContent = '';
                    resultDisplay.classList.add('result-sconosciuto');
                }
                resultDisplay.classList.add('show');
            }, 100);
        };

        // --- Logica Sezione CONSIGLI PASTI (Usa foodData globale) ---
        const getRandomItem = (arr) => {
            if (!arr || arr.length === 0) return "[dato mancante]";
            // Filtra eventuali valori null o undefined prima di mappare
            const validItems = arr.filter(item => item != null);
             if (validItems.length === 0) return "[dato mancante]";
            const items = validItems.map(item => (typeof item === 'object' && item.name) ? item.name : item);
            if (items.length === 0) return "[dato mancante]";
            return items[Math.floor(Math.random() * items.length)];
        };

        const getFilteredFoods = (options = {}) => {
            const { category, rating, count, exclude = [] } = options;
            let filtered = foodData; // Usa la variabile globale caricata
            const excludeLower = exclude.map(e => e.toLowerCase());

            if (category) {
                const categories = Array.isArray(category) ? category.map(c => c.toLowerCase()) : [category.toLowerCase()];
                filtered = filtered.filter(food => food.category && categories.includes(food.category.toLowerCase()));
            }
            if (rating) {
                const ratings = Array.isArray(rating) ? rating.map(r => r.toLowerCase()) : [rating.toLowerCase()];
                filtered = filtered.filter(food => food.rating && ratings.includes(food.rating.toLowerCase()));
            }
            if (excludeLower.length > 0) {
                filtered = filtered.filter(food => food.name && !excludeLower.includes(food.name.toLowerCase()));
            }

            // Filtra elementi che potrebbero non avere un nome (buona pratica)
             filtered = filtered.filter(food => food.name);

            filtered.sort(() => 0.5 - Math.random());
            return count ? filtered.slice(0, count).map(f => f.name) : filtered.map(f => f.name);
        };

         const generateSuggestions = (mealType) => {
             let suggestions = [];
             const maxSuggestions = 5;

             // Usa getFilteredFoods che ora opera su foodData globale
             const ottimiGrassi = getFilteredFoods({ rating: 'ottimo', category: ['grassi sani', 'frutta secca', 'semi'] });
             const buoneProteine = getFilteredFoods({ rating: ['ottimo', 'buono'], category: 'proteine' });
             const buoniCarbo = getFilteredFoods({ rating: ['ottimo', 'buono'], category: ['cereali/tuberi'] });
             const frutta = getFilteredFoods({ category: 'frutta', rating: ['ottimo', 'buono'] });
             const verdura = getFilteredFoods({ category: 'verdura', rating: ['buono', 'scarso'] }); // Scarso ok per volume/fibre
             const legumi = getFilteredFoods({ category: 'legumi', rating: 'buono' });
             const latticini = getFilteredFoods({ category: 'latticini', rating: ['ottimo', 'buono'] });
             const condimentiOttimi = getFilteredFoods({ category: 'condimenti', rating: 'ottimo' });

             const safeGetRandom = (list) => getRandomItem(list); // getRandomItem gestisce già l'array vuoto
             const safeGetRandomMultiple = (list, count = 1) => {
                 if (!list || list.length === 0) return Array(count).fill("[dato mancante]");
                 const shuffled = [...list].sort(() => 0.5 - Math.random()); // Clona l'array prima di ordinarlo
                 return shuffled.slice(0, Math.min(count, shuffled.length)); // Assicura di non chiedere più elementi di quanti ce ne siano
             }

             // Logica switch per generare suggerimenti (invariata, ma ora usa dati globali)
             switch (mealType) {
                  case 'colazione':
                     suggestions = [
                         `${safeGetRandom(latticini)} (es. Yogurt Greco intero) con ${safeGetRandom(frutta)} e ${safeGetRandom(ottimiGrassi)} (es. noci, semi di chia)`,
                         `Porridge d'avena cotto nel ${safeGetRandom(['latte', 'bevanda vegetale arricchita'])}, con ${safeGetRandom(frutta)} e ${safeGetRandom(ottimiGrassi)}`,
                         `Ricetta: Pancake/Waffle (${safeGetRandom(['farina integrale','farina d\'avena'])}) con ${safeGetRandom(frutta)} e ${safeGetRandom(['burro di arachidi', 'miele', 'sciroppo d\'acero'])}`,
                         `Ricetta: Uova (${safeGetRandom(['uova'])}) strapazzate con ${safeGetRandom(['avocado', 'formaggio', 'salmone'])} su pane integrale (${safeGetRandom(buoniCarbo)})`,
                         `Frullato ricco: ${safeGetRandom(frutta)}, ${safeGetRandom(latticini)}, ${safeGetRandom(ottimiGrassi)} (es. 1 cucchiaio olio/burro frutta secca), opzionale: ${safeGetRandom(['avena', 'spinaci'])}`
                     ];
                     break;
                 case 'pranzo':
                      const verdurePranzo = safeGetRandomMultiple(verdura, 2);
                      suggestions = [
                         `Piatto unico: ${safeGetRandom(buoniCarbo)} (es. quinoa, riso venere) + ${safeGetRandom(buoneProteine)} (es. pollo, pesce, ceci) + ${verdurePranzo.join(' e ')}. Condire con ${safeGetRandom(['olio evo'])}.`,
                         `Insalatona rinforzata: Base di ${safeGetRandom(['insalata', 'spinacino'])}, aggiungi ${safeGetRandom(buoneProteine)}/${safeGetRandom(legumi)}, ${safeGetRandom(buoniCarbo)} (es. mais, farro), ${safeGetRandom(ottimiGrassi)} (es. avocado, semi, noci) e condimento ricco.`,
                         `Zuppa di ${safeGetRandom(legumi)} o ${safeGetRandom(verdura)} arricchita con ${safeGetRandom(buoniCarbo)} (es. pasta integrale, orzo) e un filo d'${safeGetRandom(['olio d\'oliva'])} a crudo.`,
                         `Ricetta: Pasta integrale con ${safeGetRandom(condimentiOttimi.concat(['sugo di pomodoro', 'ragù magro', 'verdure saltate']))} e ${safeGetRandom(['parmigiano', 'pecorino'])} grattugiato.`,
                         `Ricetta: ${safeGetRandom(['pollo', 'tacchino', 'vitello'])} alla griglia/forno con contorno di ${safeGetRandom(['patate', 'patate dolci'])} e ${safeGetRandom(verdura)} al forno condite con olio.`
                     ];
                     break;
                 case 'merenda':
                     suggestions = [
                         `${safeGetRandom(frutta)} con una generosa manciata di ${safeGetRandom(ottimiGrassi)} (es. mandorle, anacardi)`,
                         `${safeGetRandom(['yogurt greco', 'yogurt intero'])} con ${safeGetRandom(ottimiGrassi)} e/o ${safeGetRandom(['miele', 'composta di frutta', 'cioccolato fondente a scaglie'])}`,
                         `Pane integrale (${safeGetRandom(buoniCarbo)}) con ${safeGetRandom(['avocado', 'burro di arachidi', 'formaggio spalmabile', 'ricotta e miele/marmellata'])}`,
                         `Frullato denso (vedi colazione, magari più piccolo)`,
                         `Manciata di ${safeGetRandom(ottimiGrassi)} (es. noci, pistacchi) e qualche ${safeGetRandom(['dattero', 'fico secco'])}`
                     ];
                     break;
                 case 'cena':
                      const verdureCena = safeGetRandomMultiple(verdura, 2);
                      suggestions = [
                         `${safeGetRandom(buoneProteine)} (es. salmone, orata, manzo magro) al forno/padella con ${verdureCena.join(' e ')} cotte (condite con ${safeGetRandom(ottimiGrassi)}) e una porzione di ${safeGetRandom(buoniCarbo)} (es. patate al forno, quinoa).`,
                         `Frittata/Omelette ricca con ${safeGetRandom(['uova'])} e ${safeGetRandomMultiple(verdura, 2).join('/')} e/o ${safeGetRandom(['formaggio', 'prosciutto cotto'])}, accompagnata da pane integrale.`,
                         `Passato di ${safeGetRandom(verdura)} o ${safeGetRandom(legumi)} reso più cremoso con ${safeGetRandom(['patata', 'latte di cocco', 'formaggio cremoso'])} e servito con crostini integrali e olio EVO.`,
                         `Ricetta: Polpette (di ${safeGetRandom(['manzo', 'lenticchie', 'ceci'])}) al sugo con contorno di ${safeGetRandom(verdura)} e/o purè di patate arricchito.`,
                         `Ricetta: ${safeGetRandom(['merluzzo', 'branzino'])} al cartoccio con ${safeGetRandom(verdura)}, ${safeGetRandom(['olive', 'capperi', 'pomodorini'])}, erbe aromatiche e ${safeGetRandom(['olio d\'oliva'])}.`
                      ];
                     break;
                 default:
                     suggestions = ["Tipo di pasto non riconosciuto."];
             }
             // Filtra eventuali suggerimenti vuoti o con dati mancanti prima di ritornare
              const finalSuggestions = suggestions.filter(s => s && !s.includes("[dato mancante]"));
              if (finalSuggestions.length === 0) {
                  return ["Non è stato possibile generare suggerimenti validi al momento."];
              }
             return finalSuggestions.sort(() => 0.5 - Math.random()).slice(0, maxSuggestions);
         };

         const displaySuggestions = (mealType) => {
              if (!suggestionsOutput) return;
              const generated = generateSuggestions(mealType);
              suggestionsOutput.innerHTML = ''; // Pulisce output precedente

              // Controlla se ci sono suggerimenti validi
              if (!generated || generated.length === 0 || generated[0].startsWith("Non è stato possibile")) {
                   suggestionsOutput.innerHTML = placeholderSuggestionText; // Mostra placeholder se non ci sono suggerimenti
                   if (generated && generated.length > 0) {
                      // Se c'è il messaggio di errore, mostralo
                      const pError = document.createElement('p');
                      pError.textContent = generated[0];
                      pError.style.textAlign = 'center';
                      pError.style.fontStyle = 'italic';
                      suggestionsOutput.appendChild(pError);
                   }
                   return; // Esce se non ci sono suggerimenti
              }

              // Crea titolo e lista se ci sono suggerimenti
              const title = document.createElement('h3');
              title.textContent = `Idee per ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}:`;
              suggestionsOutput.appendChild(title);
              const ul = document.createElement('ul');

              generated.forEach(suggestionText => {
                  const li = document.createElement('li');
                  if (suggestionText.toLowerCase().startsWith('ricetta:')) {
                      li.innerHTML = `<strong>Ricetta:</strong> ${suggestionText.substring(8).trim()}`;
                  } else {
                     li.textContent = suggestionText;
                  }
                  ul.appendChild(li);
              });
              suggestionsOutput.appendChild(ul);
         };

        // --- Collegamento Event Listeners (ORA che le funzioni e i dati sono pronti) ---
        if (showSuggestionsLink) {
            showSuggestionsLink.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(suggestionsSection);
                if (suggestionsOutput) suggestionsOutput.innerHTML = placeholderSuggestionText; // Resetta output
            });
        }

        if (backToVerifierLink) {
            backToVerifierLink.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(verifierSection);
                if (foodInput) foodInput.value = '';
                // Resetta correttamente TUTTI gli span del risultato
                if (resultDisplay && resultIconSpan && resultNotesSpan && resultCaloriesSpan) {
                    resultIconSpan.textContent = '';
                    resultNotesSpan.textContent = '';
                    resultCaloriesSpan.textContent = '';
                    resultDisplay.classList.remove('show', 'result-ottimo', 'result-buono', 'result-moderato', 'result-scarso', 'result-sconosciuto');
                }
            });
        }

        if (foodInput) {
            foodInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter' || event.keyCode === 13) {
                    event.preventDefault();
                    checkFood(); // Chiama la funzione definita sopra
                }
            });
            // Potresti aggiungere anche un listener 'input' per dare suggerimenti (autocomplete)
            // foodInput.addEventListener('input', handleAutocomplete); // Esempio
        }

        mealButtons.forEach(button => {
            button.addEventListener('click', () => {
                const mealType = button.getAttribute('data-meal');
                if (mealType) {
                    displaySuggestions(mealType); // Chiama la funzione definita sopra
                }
            });
        });

        console.log("App inizializzata, event listeners aggiunti.");

    } // --- Fine di initializeApp ---


    // --- Caricamento Dati JSON all'avvio ---
    fetch('foods.json') // Assicurati che il percorso sia corretto!
        .then(response => {
            if (!response.ok) { // Gestisce errori HTTP (es. 404 Not Found)
                throw new Error(`Errore HTTP! Status: ${response.status}`);
            }
            return response.json(); // Parsa la risposta come JSON
        })
        .then(data => {
            // Successo! Assegna i dati e inizializza l'app
            foodData = data;
            console.log(`Caricati ${foodData.length} alimenti dal JSON.`);
            initializeApp(); // <<< CHIAMATA FONDAMENTALE
        })
        .catch(error => {
            // Gestione Errori (File non trovato, JSON non valido, Rete, etc.)
            console.error("Impossibile caricare o processare foods.json:", error);
            // Mostra un messaggio di errore all'utente nell'interfaccia
            if (verifierSection && verifierSection.classList.contains('active-section') && resultDisplay && resultNotesSpan) {
                 resultDisplay.classList.add('show', 'result-sconosciuto');
                 resultIconSpan.textContent = '⚠️'; // Icona di avviso
                 resultNotesSpan.textContent = "Errore critico: impossibile caricare i dati alimentari. L'app non può funzionare correttamente.";
                 resultCaloriesSpan.textContent = '';
            } else if (suggestionsSection && suggestionsSection.classList.contains('active-section') && suggestionsOutput) {
                suggestionsOutput.innerHTML = `<p class="placeholder-text" style="color: var(--sconosciuto-color);">Errore critico: impossibile caricare i dati alimentari. I suggerimenti non sono disponibili.</p>`;
            }
            // Potresti voler disabilitare input/bottoni qui per evitare ulteriori errori
            if(foodInput) foodInput.disabled = true;
            mealButtons.forEach(b => b.disabled = true);
        });

    // IMPORTANTE: Non mettere qui codice che dipende da `foodData` o `foodMap`,
    // perché `fetch` è asincrono e questo codice verrebbe eseguito PRIMA
    // che i dati siano stati effettivamente caricati.

}); // --- Fine DOMContentLoaded ---