import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../layouts/Header';

describe('Header players modal UI', () => {
    test('opens Joueurs modal and displays player grid with portrait buttons', async () => {
        render(<Header />);

        // open the players modal
        const joueursBtn = screen.getByRole('button', { name: /joueurs/i });
        expect(joueursBtn).toBeInTheDocument();

        await userEvent.click(joueursBtn);

        // Title (heading) should be visible inside the modal
        const title = await screen.findByRole('heading', { name: /joueurs/i });
        expect(title).toBeInTheDocument();

        // grid should exist
        const grid = screen.getByRole('dialog').querySelector('.player-grid');
        expect(grid).toBeTruthy();

        // ensure player portrait buttons exist and have tooltips/aria-labels
        const armandBtn = screen.getByRole('button', { name: /ouvrir la fiche armand/i });
        expect(armandBtn).toBeInTheDocument();
        expect(armandBtn).toHaveAttribute('title', 'Armand');

        // The overlay element with name should be present in the DOM for this button
        const overlay = armandBtn.querySelector('.player-overlay__name');
        expect(overlay).toBeTruthy();
        expect(overlay.textContent).toBe('Armand');
    });
});
