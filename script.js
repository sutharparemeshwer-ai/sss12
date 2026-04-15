/* ============================================
   STACK VISUALIZER — SCRIPT
   Interactive 3D Stack with Animations
   ============================================ */

// ---- Stack Data Structure ----
const MAX_SIZE = 5;
let stack = [];
let currentLang = 'cpp';
let isAnimating = false;

// ---- DOM Elements ----
const stackContainer = document.getElementById('stackContainer');
const topPointer = document.getElementById('topPointer');
const emptyState = document.getElementById('emptyState');
const inputValue = document.getElementById('inputValue');
const stackSizeEl = document.getElementById('stackSize');
const logCard = document.getElementById('logCard');
const codeBlock = document.getElementById('codeBlock');
const codeFilename = document.getElementById('codeFilename');

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    renderCode('idle');
    inputValue.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handlePush();
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Close modal on overlay click
    document.getElementById('errorModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
});

// ---- Error Modal Functions ----
function showErrorModal(type) {
    const modal = document.getElementById('errorModal');
    const icon = document.getElementById('modalIcon');
    const title = document.getElementById('modalTitle');
    const message = document.getElementById('modalMessage');
    const details = document.getElementById('modalDetails');

    if (type === 'overflow') {
        icon.textContent = '🚫';
        title.textContent = 'Stack Overflow!';
        title.className = 'modal-title overflow';
        message.innerHTML = 'Stack is <strong>full</strong>! Cannot push more elements.<br> kyaa yaar sir bhara hua hai<br>Condition: <em>TOP == MAX - 1</em>';
        details.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">Condition:</span>
                <span class="detail-value error">TOP == MAX - 1</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">TOP value:</span>
                <span class="detail-value">${stack.length - 1}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">MAX size:</span>
                <span class="detail-value">${MAX_SIZE}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value error">❌ OVERFLOW</span>
            </div>
        `;
    } else if (type === 'underflow') {
        icon.textContent = '⛔';
        title.textContent = 'Stack Underflow!';
        title.className = 'modal-title underflow';
        message.innerHTML = 'Stack is <strong>empty</strong>! No element to pop.<br>kya yaar sir khali hai <br>Condition: <em>TOP == -1</em>';
        details.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">Condition:</span>
                <span class="detail-value error">TOP == -1</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">TOP value:</span>
                <span class="detail-value">-1</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Elements:</span>
                <span class="detail-value">0</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value error">❌ UNDERFLOW</span>
            </div>
        `;
    }

    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('errorModal');
    modal.classList.remove('active');
}

// ---- Background Particles ----
function createParticles() {
    const container = document.getElementById('bgParticles');
    const colors = ['#7c3aed', '#06b6d4', '#f472b6', '#34d399', '#fbbf24'];
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// ---- Get Current Time String ----
function timeNow() {
    const d = new Date();
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ---- Add Log Entry ----
function addLog(message, type = 'info') {
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.innerHTML = `
        <span class="log-time">${timeNow()}</span>
        <span class="log-msg">${message}</span>
    `;
    logCard.insertBefore(entry, logCard.firstChild);

    // Keep only last 50 entries
    while (logCard.children.length > 50) {
        logCard.removeChild(logCard.lastChild);
    }
}

// ---- Clear Log ----
function clearLog() {
    logCard.innerHTML = '';
    addLog('Log cleared.', 'info');
}

// ---- Update UI ----
function updateUI() {
    stackSizeEl.textContent = stack.length;

    // Empty state
    if (stack.length === 0) {
        emptyState.classList.remove('hidden');
        topPointer.classList.remove('visible');
    } else {
        emptyState.classList.add('hidden');
        topPointer.classList.add('visible');
    }
}

// ---- Render Stack Elements ----
function renderStack() {
    // Remove all elements except the base
    const elements = stackContainer.querySelectorAll('.stack-element');
    elements.forEach(el => el.remove());

    // Re-add elements
    stack.forEach((val, i) => {
        const el = createStackElement(val, i);
        stackContainer.insertBefore(el, stackContainer.firstChild);
    });

    updateUI();
}

// ---- Create Stack Element ----
function createStackElement(value, index) {
    const el = document.createElement('div');
    el.className = 'stack-element';
    el.innerHTML = `
        <span class="index-label">[${index}]</span>
        ${escapeHtml(value)}
    `;
    return el;
}

// ---- Escape HTML ----
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ---- PUSH Operation ----
function handlePush() {
    if (isAnimating) return;

    const value = inputValue.value.trim();
    if (!value) {
        addLog('⚠ Please enter a value to push!', 'warning');
        shakeInput();
        return;
    }

    if (stack.length >= MAX_SIZE) {
        addLog(`❌ Stack Overflow! Cannot push "${value}" — Stack is full (size = ${MAX_SIZE})`, 'error');
        renderCode('overflow');
        shakeStack();
        showErrorModal('overflow');
        return;
    }

    isAnimating = true;
    stack.push(value);
    inputValue.value = '';

    // Create and animate element
    const el = createStackElement(value, stack.length - 1);
    el.classList.add('push-anim');
    stackContainer.insertBefore(el, stackContainer.firstChild);

    updateUI();
    renderCode('push');
    addLog(`⬆ PUSH: "${value}" pushed to stack. TOP = ${stack.length - 1}`, 'success');

    setTimeout(() => {
        el.classList.remove('push-anim');
        isAnimating = false;
    }, 500);

    inputValue.focus();
}

// ---- POP Operation ----
function handlePop() {
    if (isAnimating) return;

    if (stack.length === 0) {
        addLog('❌ Stack Underflow! Cannot pop — Stack is empty.', 'error');
        renderCode('underflow');
        shakeStack();
        showErrorModal('underflow');
        return;
    }

    isAnimating = true;
    const value = stack.pop();

    // Animate top element
    const topEl = stackContainer.querySelector('.stack-element');
    if (topEl) {
        topEl.classList.add('pop-anim');
        setTimeout(() => {
            topEl.remove();
            updateUI();
            isAnimating = false;
        }, 400);
    } else {
        isAnimating = false;
    }

    renderCode('pop');
    addLog(`⬇ POP: "${value}" removed from stack. TOP = ${stack.length - 1}`, 'success');
}

// ---- PEEK Operation ----
function handlePeek() {
    if (isAnimating) return;

    if (stack.length === 0) {
        addLog('❌ Stack is empty! Nothing to peek.', 'error');
        renderCode('underflow');
        return;
    }

    const topEl = stackContainer.querySelector('.stack-element');
    if (topEl) {
        topEl.classList.add('peek-anim');
        setTimeout(() => {
            topEl.classList.remove('peek-anim');
        }, 800);
    }

    const value = stack[stack.length - 1];
    renderCode('peek');
    addLog(`👁 PEEK: Top element is "${value}" (index ${stack.length - 1})`, 'warning');
}

// ---- isEmpty Operation ----
function handleIsEmpty() {
    const empty = stack.length === 0;
    renderCode('isEmpty');

    if (empty) {
        addLog('✅ isEmpty: TRUE — Stack is empty (TOP = -1)', 'info');
    } else {
        addLog(`❓ isEmpty: FALSE — Stack has ${stack.length} element(s) (TOP = ${stack.length - 1})`, 'info');
    }
}

// ---- isFull Operation ----
function handleIsFull() {
    const full = stack.length >= MAX_SIZE;
    renderCode('isFull');

    if (full) {
        addLog(`✅ isFull: TRUE — Stack is full (${stack.length}/${MAX_SIZE})`, 'warning');
    } else {
        addLog(`❓ isFull: FALSE — Stack has space (${stack.length}/${MAX_SIZE})`, 'info');
    }
}

// ---- DISPLAY Operation ----
function handleDisplay() {
    if (isAnimating) return;

    if (stack.length === 0) {
        addLog('❌ Stack is empty! Nothing to display.', 'error');
        renderCode('underflow');
        return;
    }

    renderCode('display');

    // Wave animation: highlight each element from bottom to top
    const elements = stackContainer.querySelectorAll('.stack-element');
    const elementsArr = Array.from(elements).reverse(); // bottom-to-top order

    isAnimating = true;
    elementsArr.forEach((el, i) => {
        setTimeout(() => {
            el.classList.add('display-anim');
            setTimeout(() => {
                el.classList.remove('display-anim');
            }, 600);
        }, i * 200);
    });

    setTimeout(() => {
        isAnimating = false;
    }, elementsArr.length * 200 + 600);

    // Log all elements
    const displayStr = stack.map((v, i) => `[${i}]=${v}`).join(', ');
    addLog(`📋 DISPLAY: Stack elements (bottom→top): ${displayStr}`, 'success');
}

// ---- CLEAR Operation ----
function handleClear() {
    if (stack.length === 0) {
        addLog('Stack is already empty.', 'info');
        return;
    }

    isAnimating = true;
    const elements = stackContainer.querySelectorAll('.stack-element');

    elements.forEach((el, i) => {
        setTimeout(() => {
            el.classList.add('pop-anim');
        }, i * 80);
    });

    setTimeout(() => {
        elements.forEach(el => el.remove());
        stack = [];
        updateUI();
        renderCode('idle');
        isAnimating = false;
    }, elements.length * 80 + 400);

    addLog('🗑 CLEAR: All elements removed from stack.', 'info');
}

// ---- Shake Animations ----
function shakeStack() {
    const wrapper = document.querySelector('.stack-3d-wrapper');
    wrapper.style.animation = 'none';
    wrapper.offsetHeight; // reflow
    wrapper.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => { wrapper.style.animation = ''; }, 500);
}

function shakeInput() {
    const input = inputValue;
    input.style.animation = 'none';
    input.offsetHeight;
    input.style.animation = 'shake 0.4s ease-in-out';
    input.style.borderColor = '#ef4444';
    setTimeout(() => {
        input.style.animation = '';
        input.style.borderColor = '';
    }, 600);
}

// ---- Language Toggle ----
function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    codeFilename.textContent = lang === 'cpp' ? 'stack.cpp' : 'stack.py';
    renderCode('idle');
}

// ---- Code Rendering ----
const codeSnippets = {
    cpp: {
        idle: [
            { text: '// Stack Implementation in C++', cls: 'comment' },
            { text: '#include <iostream>', cls: '' },
            { text: 'using namespace std;', cls: '' },
            { text: '', cls: '' },
            { text: 'const int MAX = 5;', cls: '' },
            { text: 'int stack[MAX], top = -1;', cls: '' },
            { text: '', cls: '' },
            { text: '// Click any operation button', cls: 'comment' },
            { text: '// to see its algorithm here!', cls: 'comment' },
        ],
        push: [
            { text: '// PUSH Operation', cls: 'comment' },
            { text: 'void push(int value) {', cls: '' },
            { text: '  if (top == MAX - 1) {', cls: '', hl: false },
            { text: '    cout << "Stack Overflow";', cls: '', hl: false },
            { text: '    return;', cls: '', hl: false },
            { text: '  }', cls: '' },
            { text: '  top++;', cls: '', hl: true },
            { text: '  stack[top] = value;', cls: '', hl: true },
            { text: '  cout << value << " pushed";', cls: '', hl: true },
            { text: '}', cls: '' },
        ],
        pop: [
            { text: '// POP Operation', cls: 'comment' },
            { text: 'void pop() {', cls: '' },
            { text: '  if (top == -1) {', cls: '', hl: false },
            { text: '    cout << "Stack Underflow";', cls: '', hl: false },
            { text: '    return;', cls: '', hl: false },
            { text: '  }', cls: '' },
            { text: '  int val = stack[top];', cls: '', hl: true },
            { text: '  top--;', cls: '', hl: true },
            { text: '  cout << val << " popped";', cls: '', hl: true },
            { text: '}', cls: '' },
        ],
        peek: [
            { text: '// PEEK Operation', cls: 'comment' },
            { text: 'void peek() {', cls: '' },
            { text: '  if (top == -1) {', cls: '' },
            { text: '    cout << "Stack is Empty";', cls: '' },
            { text: '    return;', cls: '' },
            { text: '  }', cls: '' },
            { text: '  cout << "Top: " << stack[top];', cls: '', hl: true },
            { text: '}', cls: '' },
        ],
        isEmpty: [
            { text: '// isEmpty Operation', cls: 'comment' },
            { text: 'bool isEmpty() {', cls: '' },
            { text: '  if (top == -1)', cls: '', hl: true },
            { text: '    return true;', cls: '', hl: true },
            { text: '  else', cls: '' },
            { text: '    return false;', cls: '', hl: true },
            { text: '}', cls: '' },
        ],
        isFull: [
            { text: '// isFull Operation', cls: 'comment' },
            { text: 'bool isFull() {', cls: '' },
            { text: '  if (top == MAX - 1)', cls: '', hl: true },
            { text: '    return true;', cls: '', hl: true },
            { text: '  else', cls: '' },
            { text: '    return false;', cls: '', hl: true },
            { text: '}', cls: '' },
        ],
        display: [
            { text: '// DISPLAY Operation', cls: 'comment' },
            { text: 'void display() {', cls: '' },
            { text: '  if (top == -1) {', cls: '' },
            { text: '    cout << "Stack is Empty";', cls: '' },
            { text: '    return;', cls: '' },
            { text: '  }', cls: '' },
            { text: '  cout << "Stack elements:";', cls: '', hl: true },
            { text: '  for (int i = top; i >= 0; i--)', cls: '', hl: true },
            { text: '    cout << stack[i] << " ";', cls: '', hl: true },
            { text: '}', cls: '' },
        ],
        overflow: [
            { text: '// PUSH — Overflow!', cls: 'comment' },
            { text: 'void push(int value) {', cls: '' },
            { text: '  if (top == MAX - 1) {', cls: '', hl: true },
            { text: '    // ❌ OVERFLOW!', cls: 'comment', hl: true },
            { text: '    cout << "Stack Overflow";', cls: '', hl: true },
            { text: '    return;', cls: '', hl: true },
            { text: '  }', cls: '' },
            { text: '  top++;', cls: '' },
            { text: '  stack[top] = value;', cls: '' },
            { text: '}', cls: '' },
        ],
        underflow: [
            { text: '// POP — Underflow!', cls: 'comment' },
            { text: 'void pop() {', cls: '' },
            { text: '  if (top == -1) {', cls: '', hl: true },
            { text: '    // ❌ UNDERFLOW!', cls: 'comment', hl: true },
            { text: '    cout << "Stack Underflow";', cls: '', hl: true },
            { text: '    return;', cls: '', hl: true },
            { text: '  }', cls: '' },
            { text: '  int val = stack[top];', cls: '' },
            { text: '  top--;', cls: '' },
            { text: '}', cls: '' },
        ],
    },

    python: {
        idle: [
            { text: '# Stack Implementation in Python', cls: 'comment' },
            { text: '', cls: '' },
            { text: 'MAX = 5', cls: '' },
            { text: 'stack = []', cls: '' },
            { text: '', cls: '' },
            { text: '# Click any operation button', cls: 'comment' },
            { text: '# to see its algorithm here!', cls: 'comment' },
        ],
        push: [
            { text: '# PUSH Operation', cls: 'comment' },
            { text: 'def push(value):', cls: '' },
            { text: '    if len(stack) == MAX:', cls: '' },
            { text: '        print("Stack Overflow")', cls: '' },
            { text: '        return', cls: '' },
            { text: '    stack.append(value)', cls: '', hl: true },
            { text: '    print(f"{value} pushed")', cls: '', hl: true },
        ],
        pop: [
            { text: '# POP Operation', cls: 'comment' },
            { text: 'def pop():', cls: '' },
            { text: '    if len(stack) == 0:', cls: '' },
            { text: '        print("Stack Underflow")', cls: '' },
            { text: '        return', cls: '' },
            { text: '    val = stack.pop()', cls: '', hl: true },
            { text: '    print(f"{val} popped")', cls: '', hl: true },
        ],
        peek: [
            { text: '# PEEK Operation', cls: 'comment' },
            { text: 'def peek():', cls: '' },
            { text: '    if len(stack) == 0:', cls: '' },
            { text: '        print("Stack is Empty")', cls: '' },
            { text: '        return', cls: '' },
            { text: '    print(f"Top: {stack[-1]}")', cls: '', hl: true },
        ],
        isEmpty: [
            { text: '# isEmpty Operation', cls: 'comment' },
            { text: 'def is_empty():', cls: '' },
            { text: '    if len(stack) == 0:', cls: '', hl: true },
            { text: '        return True', cls: '', hl: true },
            { text: '    else:', cls: '' },
            { text: '        return False', cls: '', hl: true },
        ],
        isFull: [
            { text: '# isFull Operation', cls: 'comment' },
            { text: 'def is_full():', cls: '' },
            { text: '    if len(stack) == MAX:', cls: '', hl: true },
            { text: '        return True', cls: '', hl: true },
            { text: '    else:', cls: '' },
            { text: '        return False', cls: '', hl: true },
        ],
        display: [
            { text: '# DISPLAY Operation', cls: 'comment' },
            { text: 'def display():', cls: '' },
            { text: '    if len(stack) == 0:', cls: '' },
            { text: '        print("Stack is Empty")', cls: '' },
            { text: '        return', cls: '' },
            { text: '    print("Stack elements:")', cls: '', hl: true },
            { text: '    for i in range(len(stack)-1,-1,-1):', cls: '', hl: true },
            { text: '        print(stack[i], end=" ")', cls: '', hl: true },
        ],
        overflow: [
            { text: '# PUSH — Overflow!', cls: 'comment' },
            { text: 'def push(value):', cls: '' },
            { text: '    if len(stack) == MAX:', cls: '', hl: true },
            { text: '        # ❌ OVERFLOW!', cls: 'comment', hl: true },
            { text: '        print("Stack Overflow")', cls: '', hl: true },
            { text: '        return', cls: '', hl: true },
            { text: '    stack.append(value)', cls: '' },
        ],
        underflow: [
            { text: '# POP — Underflow!', cls: 'comment' },
            { text: 'def pop():', cls: '' },
            { text: '    if len(stack) == 0:', cls: '', hl: true },
            { text: '        # ❌ UNDERFLOW!', cls: 'comment', hl: true },
            { text: '        print("Stack Underflow")', cls: '', hl: true },
            { text: '        return', cls: '', hl: true },
            { text: '    val = stack.pop()', cls: '' },
        ],
    }
};

function renderCode(operation) {
    const lines = codeSnippets[currentLang][operation] || codeSnippets[currentLang]['idle'];
    codeBlock.innerHTML = '';

    lines.forEach((line, i) => {
        const span = document.createElement('span');
        span.className = 'code-line' + (line.hl ? ' highlight' : '');

        // Syntax highlighting
        let text = escapeHtml(line.text);

        if (currentLang === 'cpp') {
            text = text
                .replace(/\b(void|int|bool|const|return|if|else|using|namespace)\b/g, '<span class="keyword">$1</span>')
                .replace(/\b(cout|endl|string)\b/g, '<span class="type">$1</span>')
                .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
                .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
                .replace(/(#include\s+&lt;.*?&gt;)/g, '<span class="type">$1</span>')
                .replace(/(&quot;.*?&quot;)/g, '<span class="string">$1</span>');
        } else {
            text = text
                .replace(/\b(def|if|else|return|print|True|False)\b/g, '<span class="keyword">$1</span>')
                .replace(/\b(len|append|pop)\b/g, '<span class="func">$1</span>')
                .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
                .replace(/(#.*)/g, '<span class="comment">$1</span>')
                .replace(/(f&quot;.*?&quot;|&quot;.*?&quot;)/g, '<span class="string">$1</span>');
        }

        if (line.cls === 'comment') {
            span.innerHTML = `<span class="comment">${text}</span>`;
        } else {
            span.innerHTML = text || '&nbsp;';
        }

        codeBlock.appendChild(span);
    });
}
