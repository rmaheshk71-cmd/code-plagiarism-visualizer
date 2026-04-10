document.addEventListener('DOMContentLoaded', () => {

    const stepUpload = document.getElementById('step-upload');
    const stepResults = document.getElementById('step-results');
    const stepVerdict = document.getElementById('step-verdict');
    
    const file1Input = document.getElementById('file1');
    const file2Input = document.getElementById('file2');
    const file1Name = document.getElementById('file1-name');
    const file2Name = document.getElementById('file2-name');
    
    const uploadForm = document.getElementById('upload-form');
    const btnStart = document.getElementById('btn-start');
    const loadingDiv = document.getElementById('loading');
    
    const btnCheckPlagiarism = document.getElementById('btn-check-plagiarism');
    const btnReset = document.getElementById('btn-reset');
    
    // Results
    const simValue = document.getElementById('sim-value');
    const simCircle = document.getElementById('sim-circle');
    const flagCount = document.getElementById('flag-count');
    const pairsList = document.getElementById('pairs-list');
    
    const verdictBanner = document.getElementById('verdict-banner');
    const verdictTitle = document.getElementById('verdict-title');
    const verdictDesc = document.getElementById('verdict-desc');

    let currentSimilarity = 0;
    
    // File input change handlers
    file1Input.addEventListener('change', (e) => {
        if(e.target.files[0]) file1Name.textContent = e.target.files[0].name;
    });
    file2Input.addEventListener('change', (e) => {
        if(e.target.files[0]) file2Name.textContent = e.target.files[0].name;
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const f1 = file1Input.files[0];
        const f2 = file2Input.files[0];
        if(!f1 || !f2) return alert("Please select both files.");

        // Show loading
        btnStart.classList.add('hidden');
        loadingDiv.classList.remove('hidden');

        try {
            const formData = new FormData();
            formData.append('file1', f1);
            formData.append('file2', f2);

            const res = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            if(!res.ok) throw new Error("Processing failed");

            const data = await res.json();
            
            // Populate Results
            currentSimilarity = data.similarity; // e.g. 85.5
            animateCircle(currentSimilarity);
            
            flagCount.textContent = data.flagged_pairs.length;
            
            pairsList.innerHTML = '';
            if(data.flagged_pairs.length === 0) {
                pairsList.innerHTML = '<p class="pair-item">No significant identical chunks found.</p>';
            } else {
                data.flagged_pairs.forEach(pair => {
                    const item = document.createElement('div');
                    item.className = 'pair-item';
                    item.innerHTML = `
                        <strong>Match (${pair.similarity}%):</strong>
                        <code>File 1: ${escapeHtml(pair.chunk1_preview)}</code>
                        <code>File 2: ${escapeHtml(pair.chunk2_preview)}</code>
                    `;
                    pairsList.appendChild(item);
                });
            }

            // Transition UI
            setTimeout(() => {
                stepUpload.classList.remove('active');
                stepResults.classList.add('active');
            }, 800); // minimal fake delay to make it feel "processed"
            
        } catch(error) {
            alert("Error: " + error.message);
            btnStart.classList.remove('hidden');
            loadingDiv.classList.add('hidden');
        }
    });

    btnCheckPlagiarism.addEventListener('click', () => {
        stepResults.classList.remove('active');
        stepVerdict.classList.add('active');
        
        // Judgment logic (Threshold >= 60%)
        const isPlagiarised = currentSimilarity >= 60;
        
        if(isPlagiarised) {
            verdictBanner.className = 'banner plagiarism';
            verdictTitle.textContent = "Plagiarism Detected!";
            verdictDesc.textContent = `The code chunks share a massive ${currentSimilarity}% structural similarity, indicating highly probable cheating bypassing normal variable renaming.`;
        } else {
            verdictBanner.className = 'banner clean';
            verdictTitle.textContent = "Code is Clean";
            verdictDesc.textContent = `Only ${currentSimilarity}% identical structures. No significant obfuscated copying detected.`;
        }
    });

    btnReset.addEventListener('click', () => {
        // Reset UI
        stepVerdict.classList.remove('active');
        stepUpload.classList.add('active');
        uploadForm.reset();
        file1Name.textContent = "No file selected";
        file2Name.textContent = "No file selected";
        btnStart.classList.remove('hidden');
        loadingDiv.classList.add('hidden');
    });

    function animateCircle(percentage) {
        // SVG circle logic: 339 is total circumference
        const totalOffset = 339;
        const normalized = Math.min(Math.max(percentage, 0), 100);
        const offset = totalOffset - (normalized / 100) * totalOffset;
        
        simCircle.style.strokeDashoffset = totalOffset; // start
        
        setTimeout(() => {
            simCircle.style.strokeDashoffset = offset;
            animateValue(simValue, 0, normalized, 1500);
        }, 300);
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = (progress * (end - start) + start).toFixed(1);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    
    function escapeHtml(unsafe) {
        return unsafe.replace(/&/g, "&amp;")
                     .replace(/</g, "&lt;")
                     .replace(/>/g, "&gt;")
                     .replace(/"/g, "&quot;")
                     .replace(/'/g, "&#039;");
    }
});
