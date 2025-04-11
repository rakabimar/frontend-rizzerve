import { render, screen } from '@testing-library/react';
import Hello from '../hello';

describe('hello Component', () => {
    it('renders hello message', () => {
        render(<Hello />);
    expect(screen.getByText('Hello, Rizzerve!')).toBeInTheDocument();
    });
});
