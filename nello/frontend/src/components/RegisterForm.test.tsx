import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../test-utils";
import { RegisterForm } from "./RegisterForm";
import * as AuthContext from "../state/AuthContext";

vi.mock("../state/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("RegisterForm", () => {
  const mockRegister = vi.fn();
  const mockSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (AuthContext.useAuth as any).mockReturnValue({
      register: mockRegister,
      loading: false,
      error: null,
    });
  });

  it("renders email, invitation key, and password fields", () => {
    render(<RegisterForm onSwitchToLogin={mockSwitchToLogin} />);

    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Invitation key")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Register" })).toBeTruthy();
  });

  it("calls register with all three fields on submit", () => {
    render(<RegisterForm onSwitchToLogin={mockSwitchToLogin} />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@acme.com" } });
    fireEvent.change(screen.getByLabelText("Invitation key"), { target: { value: "INVITE-2026" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "securepassword123" } });
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(mockRegister).toHaveBeenCalledWith("new@acme.com", "INVITE-2026", "securepassword123");
  });

  it("shows error message when auth context has error", () => {
    (AuthContext.useAuth as any).mockReturnValue({
      register: mockRegister,
      loading: false,
      error: "Registration failed: invalid key",
    });

    render(<RegisterForm onSwitchToLogin={mockSwitchToLogin} />);
    expect(screen.getByText("Registration failed: invalid key")).toBeTruthy();
  });

  it("disables submit button while loading", () => {
    (AuthContext.useAuth as any).mockReturnValue({
      register: mockRegister,
      loading: true,
      error: null,
    });

    render(<RegisterForm onSwitchToLogin={mockSwitchToLogin} />);
    expect(screen.getByRole("button", { name: "Please wait..." })).toBeTruthy();
  });

  it("calls onSwitchToLogin when login link is clicked", () => {
    render(<RegisterForm onSwitchToLogin={mockSwitchToLogin} />);

    fireEvent.click(screen.getByText("Already have an account? Login"));
    expect(mockSwitchToLogin).toHaveBeenCalledOnce();
  });
});
