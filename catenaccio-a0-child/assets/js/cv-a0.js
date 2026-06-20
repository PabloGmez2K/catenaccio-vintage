/**
 * cv-a0.js — Catenaccio A0 Child | Sesión 013 — 2026-06-20
 *
 * Toggle off-canvas: apertura, cierre por botón, cierre por backdrop, cierre por ESC.
 * Toggle cv-archive-intro: expandir/colapsar intro SEO en páginas de archivo.
 *
 * Sin dependencias de Elementor. Defensivo: funciona si faltan elementos del DOM.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        // =====================================================================
        // OFF-CANVAS TOGGLE
        // =====================================================================
        var panel    = document.getElementById('cv-offcanvas-panel');
        var backdrop = document.getElementById('cv-offcanvas-backdrop');
        var toggle   = document.querySelector('.cv-offcanvas-toggle');
        var closeBtn = document.querySelector('.cv-offcanvas-close');

        if (panel) {
            function openPanel() {
                panel.setAttribute('aria-hidden', 'false');
                if (toggle) toggle.setAttribute('aria-expanded', 'true');
                document.body.classList.add('cv-offcanvas-open');
                // Focus al primer elemento interactivo del panel para accesibilidad
                var firstFocusable = panel.querySelector('a, button, input, [tabindex]');
                if (firstFocusable) firstFocusable.focus();
            }

            function closePanel() {
                panel.setAttribute('aria-hidden', 'true');
                if (toggle) toggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('cv-offcanvas-open');
                // Devolver foco al toggle
                if (toggle) toggle.focus();
            }

            if (toggle)   toggle.addEventListener('click', openPanel);
            if (closeBtn) closeBtn.addEventListener('click', closePanel);
            if (backdrop) backdrop.addEventListener('click', closePanel);

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && panel.getAttribute('aria-hidden') === 'false') {
                    closePanel();
                }
            });

            // Trampa de foco dentro del panel cuando está abierto
            panel.addEventListener('keydown', function (e) {
                if (e.key !== 'Tab') return;
                var focusables = panel.querySelectorAll(
                    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                if (!focusables.length) return;
                var first = focusables[0];
                var last  = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    last.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === last) {
                    first.focus();
                    e.preventDefault();
                }
            });
        }

        // =====================================================================
        // CV-ARCHIVE-INTRO TOGGLE (Ver más / Ver menos)
        // =====================================================================
        document.querySelectorAll('.cv-archive-intro__toggle').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var targetId = btn.getAttribute('data-target');
                var textEl   = targetId ? document.getElementById(targetId) : null;
                if (!textEl) return;

                var isExpanded = btn.getAttribute('aria-expanded') === 'true';

                textEl.classList.toggle('is-expanded', !isExpanded);
                btn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
                btn.textContent = isExpanded
                    ? (btn.getAttribute('data-label-more') || 'Ver más')
                    : (btn.getAttribute('data-label-less') || 'Ver menos');
            });
        });

    });

}());
