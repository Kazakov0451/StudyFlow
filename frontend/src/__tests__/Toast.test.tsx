import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '../components/Toast';

const TestComponent = () => {
  const { addToast } = useToast();
  return (
    <div>
      <button onClick={() => addToast('Success message', 'success')}>Show Success</button>
      <button onClick={() => addToast('Error message', 'error')}>Show Error</button>
      <button onClick={() => addToast('Info message', 'info')}>Show Info</button>
    </div>
  );
};

describe('Toast Component', () => {
  it('should render toast provider without errors', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    expect(screen.getByText('Show Success')).toBeInTheDocument();
  });

  it('should show success toast when triggered', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    fireEvent.click(screen.getByText('Show Success'));
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  it('should show error toast when triggered', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    fireEvent.click(screen.getByText('Show Error'));
    
    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  it('should show info toast when triggered', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    fireEvent.click(screen.getByText('Show Info'));
    
    await waitFor(() => {
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });
  });

  it('should auto-dismiss toast after 3 seconds', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    
    fireEvent.click(screen.getByText('Show Success'));
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    // Wait for auto-dismiss
    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    }, { timeout: 4000 });
  });
});
