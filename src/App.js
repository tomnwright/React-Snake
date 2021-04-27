import "./App.css";
import Board from "./components/board"
import Footer from "./components/footer"
function App() {
  return (
    <>
    <div className="App">
      <Board />
      <p>Use the arrow keys to move the snake.</p>
    </div>
    <Footer />
    </>
  );
}

export default App;