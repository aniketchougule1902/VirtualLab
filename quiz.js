document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    const questionBlocks = document.querySelectorAll('.quiz-section .example-box');

    questionBlocks.forEach((block, index) => {
        const questionEl = block.querySelector('h4');
        const paragraphs = Array.from(block.querySelectorAll('p'));
        const optionsPara = paragraphs.find(p => p.textContent.includes('Options:'));
        const answerPara = paragraphs.find(p => p.textContent.includes('Correct Option:'));
        const solutionList = block.querySelector('ol');

        if (!questionEl || !optionsPara || !answerPara || !solutionList) {
            return;
        }

        const optionsText = optionsPara.textContent.replace('Options:', '').trim();
        const options = optionsText.match(/[A-D]\)\s.*?(?=(?:\s[A-D]\)\s)|$)/g);
        const correctOption = answerPara.textContent.replace('Correct Option:', '').trim().charAt(0).toUpperCase();

        if (!options || options.length === 0 || !correctOption) {
            return;
        }

        const questionTitle = questionEl.cloneNode(true);
        const optionsWrapper = document.createElement('div');
        optionsWrapper.className = 'quiz-options';

        options.forEach(option => {
            const optionLetter = option.charAt(0);
            const optionText = option.replace(/^[A-D]\)\s*/, '').trim();
            const label = document.createElement('label');
            label.className = 'quiz-option';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `quiz-${index}`;
            input.value = optionLetter;

            const textSpan = document.createElement('span');
            textSpan.textContent = `${optionLetter}) ${optionText}`;

            label.appendChild(input);
            label.appendChild(textSpan);
            optionsWrapper.appendChild(label);
        });

        const checkButton = document.createElement('button');
        checkButton.type = 'button';
        checkButton.className = 'btn btn-primary quiz-check-btn';
        checkButton.textContent = 'Check Answer';

        const feedback = document.createElement('div');
        feedback.className = 'quiz-feedback';

        const solutionContainer = document.createElement('div');
        solutionContainer.className = 'quiz-solution';
        solutionContainer.style.display = 'none';

        const solutionTitle = document.createElement('p');
        solutionTitle.className = 'quiz-solution-title';
        solutionTitle.textContent = 'Stepwise Solution:';

        solutionContainer.appendChild(solutionTitle);
        solutionContainer.appendChild(solutionList.cloneNode(true));

        checkButton.addEventListener('click', () => {
            const selectedOption = optionsWrapper.querySelector(`input[name="quiz-${index}"]:checked`);

            if (!selectedOption) {
                feedback.className = 'quiz-feedback warning';
                feedback.textContent = 'Please select an option before checking your answer.';
                solutionContainer.style.display = 'none';
                return;
            }

            const isCorrect = selectedOption.value === correctOption;

            if (isCorrect) {
                feedback.className = 'quiz-feedback correct';
                feedback.textContent = 'Correct! Great work.';
            } else {
                feedback.className = 'quiz-feedback incorrect';
                feedback.textContent = `Incorrect. Correct option: ${correctOption}.`;
            }

            solutionContainer.style.display = 'block';
        });

        block.innerHTML = '';
        block.appendChild(questionTitle);
        block.appendChild(optionsWrapper);
        block.appendChild(checkButton);
        block.appendChild(feedback);
        block.appendChild(solutionContainer);
    });
});
