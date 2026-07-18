import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createBoard, getBoards } from "../api/boards";
import type { Board } from "../types";
import { useAuthStore } from "../store/authStore";

export function BoardListPage() {
  const email = useAuthStore((state) => state.email);
  const logout = useAuthStore((state) => state.logout);
  const [boards, setBoards] = useState<Board[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBoards = async () => {
    setLoading(true);
    setError(null);
    try {
      setBoards(await getBoards());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBoards();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      return;
    }
    try {
      const board = await createBoard(nextName);
      setBoards((current) => [board, ...current]);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board");
    }
  };

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <h1>Your boards</h1>
          <p className="muted">{email}</p>
        </div>
        <button type="button" className="ghost-button" onClick={logout}>
          Logout
        </button>
      </div>
      <form className="toolbar" onSubmit={handleCreate}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="New board name" />
        <button type="submit" className="primary-button">
          Create board
        </button>
      </form>
      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="muted">Loading boards…</p> : null}
      <div className="board-grid">
        {boards.map((board) => (
          <Link key={board.id} className="board-tile" to={`/boards/${board.id}`}>
            <strong>{board.name}</strong>
            <span className="muted">Owner: {board.owner.email}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
