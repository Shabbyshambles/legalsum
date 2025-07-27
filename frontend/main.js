const summarizeButton = document.getElementById('summarize-button');
const fileInput = document.getElementById('file-input');
const summaryOutput = document.getElementById('summary-output');

summarizeButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file.');
        return;
    }

    summaryOutput.innerText = 'Summarizing...';

    const reader = new FileReader();
    reader.onload = async (event) => {
        const pdfData = new Uint8Array(event.target.result);
        const pdfText = await getTextFromPdf(pdfData);
        const summary = await summarizeText(pdfText);
        summaryOutput.innerText = summary;
    };
    reader.readAsArrayBuffer(file);
});

async function getTextFromPdf(pdfData) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ');
    }
    return text;
}

async function summarizeText(text) {
    const url = 'http://localhost:8000/summarize';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "contents": [
                {
                    "parts": [
                        {
                            "text": `Summarize the following legal document in 5 pages or less with specifics such as dollar amounts, specific organizations or agencies, and percentages:\n\n${text}`
                        }
                    ]
                }
            ]
        })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}