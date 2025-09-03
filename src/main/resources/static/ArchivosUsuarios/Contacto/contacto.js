document.addEventListener('DOMContentLoaded', () => {
    function showToast(text) {
        let t = document.getElementById('copy-toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'copy-toast';
            Object.assign(t.style, {
                position: 'fixed',
                left: '50%',
                bottom: '28px',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.78)',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                zIndex: 9999,
                opacity: '0',
                transition: 'opacity .18s ease, transform .18s ease'
            });
            document.body.appendChild(t);
        }
        t.textContent = text;
        t.style.opacity = '1';
        t.style.transform = 'translateX(-50%) translateY(0)';
        clearTimeout(t._hideTimeout);
        t._hideTimeout = setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateX(-50%) translateY(8px)';
        }, 1800);
    }

    function copyText(text) {
        if (!text) return Promise.reject(new Error('No text to copy'));
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise((resolve, reject) => {
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                const ok = document.execCommand('copy');
                document.body.removeChild(ta);
                ok ? resolve() : reject(new Error('Copy command failed'));
            } catch (e) {
                reject(e);
            }
        });
    }

    const telLinks = Array.from(document.querySelectorAll('a[href^="tel:"]'));
    telLinks.forEach(link => {
        link.addEventListener('click', async (ev) => {
            ev.preventDefault();
            const href = link.getAttribute('href') || '';
            const number = href.replace(/^tel:/i, '').trim();
            try {
                await copyText(number);
                showToast('Número copiado: ' + number);
            } catch (err) {
                console.warn('No se pudo copiar:', err);
                showToast('No se pudo copiar el número');
            }
        });
    });
});
