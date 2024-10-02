// Function to handle lookup operations for dictionary, synonyms, and antonyms
function lookup(type) {
    // Map form IDs based on the type of lookup
    const formId = {
        dictionary: "lookup-form",
        synonyms: "search-form",
        antonyms: "check-form"
    }[type];

    // Map result container IDs based on the type of lookup
    const resultId = {
        dictionary: "results",
        synonyms: "synonymsList-results",
        antonyms: "antonymsList-results"
    }[type];

    // Get the appropriate form element
    const form = document.getElementById(formId);

    // Handle form submission
    form.addEventListener("submit", function(event) {
        event.preventDefault();

        // Get the word from the form data
        const formData = new FormData(form);
        const word = formData.get("word");

        // Show a loading message
        document.getElementById(resultId).innerHTML = `<p>Searching for ${type} of <em>${word}</em>...</p>`;

        // Make an API request to fetch word data
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
            .then(response => response.json())
            .then(data => {
                let output = {};

                // Process data based on the type of lookup
                if (type === "dictionary") {
                    output = {
                        word: data[0].word,
                        phonetic: data[0].phonetic,
                        meanings: data[0].meanings,
                        audioUrl: data[0].phonetics && data[0].phonetics[0],
                        audio: data[0].phonetics[0]?.audio
                    };
                } else if (type === "synonyms") {
                    output = {
                        word: data[0].word,
                        synonyms: data[0].meanings[0]?.synonyms || []
                    };
                } else if (type === "antonyms") {
                    output = {
                        word: data[0].word,
                        antonyms: data[0].meanings[1]?.antonyms || []
                    };
                }

                // Get the template for rendering results
                const templateId = {
                    dictionary: "results-template",
                    synonyms: "syno-results-template",
                    antonyms: "anto-results-template"
                }[type];

                const template = document.getElementById(templateId).innerText;
                const compiledTemplate = Handlebars.compile(template);

                // Render the results using Handlebars
                document.getElementById(resultId).innerHTML = compiledTemplate(output);

                // Handle audio playback for dictionary results
                if (type === "dictionary" && output.audio) {
                    const audioElement = document.querySelector('audio');
                    audioElement.addEventListener('click', () => {
                        audioElement.play();
                    });
                }
            })
            .catch(() => {
                // Handle errors in the API request
                document.getElementById(resultId).innerHTML = `<p>Error finding ${type} for <em>${word}</em>.</p>`;
            });
    });
}

// Initialize the application after the page loads
window.addEventListener('load', () => {
    const app = document.getElementById('app');

    // Compile Handlebars templates
    const dictionaryTemplate = Handlebars.compile(document.getElementById('dictionary-template').innerHTML);
    const thesaurusTemplate = Handlebars.compile(document.getElementById('thesaurus-template').innerHTML);
    const synonymsTemplate = Handlebars.compile(document.getElementById('synonyms-template').innerHTML);
    const antonymsTemplate = Handlebars.compile(document.getElementById('antonyms-template').innerHTML);

    // Simple router setup
    const router = new Router({
        mode: 'hash',
        root: 'index.html'
    });

    // Define route handlers
    router.add('/dictionary', async () => {
        app.innerHTML = dictionaryTemplate();
        lookup('dictionary');
    });

    router.add('/thesaurus', async () => {
        app.innerHTML = thesaurusTemplate();
    });

    router.add('/synonyms', async () => {
        app.innerHTML = synonymsTemplate();
        lookup('synonyms');
    });

    router.add('/antonyms', async () => {
        app.innerHTML = antonymsTemplate();
        lookup('antonyms');
    });

    // Start the router and navigate to the default route
    router.addUriListener();
    router.navigateTo('/');
});
