import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import MJ from '../routes/MJ';

const mockPlayer = (name) => ({
    identity: { name },
    features: { affinity: 2, knowledge: 3, charism: 1, intuition: 0, technical: 1, action: 0, stars: { type: '', name: '' } },
    health: { forme: true, minorInjury: false, severeInjury: false, seriousInjury: false },
    stuff: [],
    inventory: { slot1: 'test' },
    notes: 'hello',
    inspiration: false,
    agentType: 'Novice'
});

describe('MJ multi-select', () => {
    beforeEach(() => {
        global.fetch = jest.fn((url) => {
            const key = url.split('/').pop();
            return Promise.resolve({ json: () => Promise.resolve(mockPlayer(key)) });
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('select multiple players and render their panels', async () => {
        const {container} = render(<MJ />);

        const armandBtn = screen.getByRole('button', { name: /armand/i });
        const bernardBtn = screen.getByRole('button', { name: /bernard/i });

        await userEvent.click(armandBtn);
        await userEvent.click(bernardBtn);

        // Attendre que fetch soit appelé et que les panneaux apparaissent
        await waitFor(() => expect(global.fetch).toHaveBeenCalled());
        // Permettre aux microtasks de la promesse fetch de se résoudre pour que playersData se mette à jour
        await act(async () => { await Promise.resolve(); await Promise.resolve(); });
        // S'assurer que les données du joueur sont chargées (valeur d'affinité initiale présente)
        await waitFor(() => expect(container.querySelector('.player-panel .card.features input[name="affinity"]').value).toBe('2'));
        // S'assurer que les données initiales du joueur sont chargées avant interaction
        await waitFor(() => expect(container.querySelector('.player-panel .card.features input[name="affinity"]').value).toBe('2'));
        // S'assurer que les données du joueur ont fini de charger avant édition
        await waitFor(() => expect(container.querySelector('.player-panel .card.features input[name="affinity"]').value).toBe('2'));
        // S'assurer que les données ont fini de charger et que l'input features affiche la valeur initiale
        await waitFor(() => expect(container.querySelector('.player-panel .card.features input[name="affinity"]').value).toBe('2'));

        // containers: ensure we have two player panels
        await waitFor(() => expect(container.querySelectorAll('.player-panel').length).toBe(2));

        // ensure Features sections exist in each panel
        const featuresCards = container.querySelectorAll('.card.features');
        expect(featuresCards.length).toBeGreaterThanOrEqual(2);
    });

    test('no dock control is present (dock removed)', async () => {
        const {container} = render(<MJ />);
        const armandBtn = screen.getByRole('button', { name: /armand/i });

        await userEvent.click(armandBtn);
        await waitFor(() => expect(global.fetch).toHaveBeenCalled());

        // find dock toggle inside the first player-panel
        const firstPanel = container.querySelector('.player-panel');
        expect(firstPanel).toBeTruthy();
        const dockBtn = firstPanel.querySelector('.dock-toggle');
        // dock feature was removed — ensure no dock toggle is present
        expect(dockBtn).toBeFalsy();
    });

    test('shows spinner when saving is pending and marks saved when resolved', async () => {
        // ensure API is set so savePlayer will run
        const prevApi = process.env.REACT_APP_BASE_URL_API;
        const prevDebounce = process.env.REACT_APP_SAVE_DEBOUNCE_MS;
        // speed up debounce for test (run immediately)
        process.env.REACT_APP_SAVE_DEBOUNCE_MS = '0';
        process.env.REACT_APP_BASE_URL_API = 'http://test';

        // custom fetch: GET resolves, POST remains pending until we resolve it
        let postResolve;
        // make the GET .json() return synchronously so playersData is applied quickly in tests
        global.fetch = jest.fn((url, opts) => {
            if (!opts || opts.method !== 'POST') {
                const key = url.split('/').pop();
                return Promise.resolve({ json: () => mockPlayer(key) });
            }
            return new Promise((res) => { postResolve = res; });
        });

        const {container} = render(<MJ />);
        const armandBtn = screen.getByRole('button', { name: /armand/i });
        await userEvent.click(armandBtn);
        await waitFor(() => expect(global.fetch).toHaveBeenCalled());

        // change a feature input to trigger save
        const affinityInput = container.querySelector('.player-panel .card.features input[name="affinity"]');
        // current value (was loaded synchronously)
        expect(affinityInput).toBeTruthy();

        await act(async () => {
            await userEvent.clear(affinityInput);
            await userEvent.type(affinityInput, '9');
            // wait a short bit for debounce + save to be scheduled (0ms debounce -> next macrotask)
            await new Promise((r) => setTimeout(r, 10));
        });

        // after advancing timers, the POST save should be in-flight (2nd fetch)
        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2), {timeout: 2000});
        // verify at least one POST happened
        const postCalls = global.fetch.mock.calls.filter(c => c[1] && c[1].method === 'POST');
        expect(postCalls.length).toBeGreaterThanOrEqual(1);
        // and UI should show saving indicator
        await waitFor(() => expect(container.querySelector('.save-indicator.saving')).toBeTruthy(), {timeout: 2000});

        // resolve the POST request and ensure React processes the update inside act
        if (typeof postResolve === 'function') {
            await act(async () => {
                postResolve();
                // flush a microtask so the promise chain continues
                await Promise.resolve();
            });
            // resolved
        }

        process.env.REACT_APP_BASE_URL_API = prevApi;
        process.env.REACT_APP_SAVE_DEBOUNCE_MS = prevDebounce;

        // now it should show saved indicator (do NOT run timers here — that would clear the saved label)
        await waitFor(() => expect(container.querySelector('.save-indicator.saved')).toBeTruthy(), {timeout: 2000});

        // no fake timers used here — all real timers
    });
});

            // done
