class Resizer {
    constructor(game , window) {
        this.game = game;
        this.window = window;
    }

    /**
     * Funcion de resize que se ejecutara cada vez que el dispoistivo cambie de tamano o disposicion
     */
    resize() {
        const game = this.game;
        const window = this.window;

        console.log("RESIZE!");
        const canvas = game.canvas;
        const win_width = window.innerWidth;
        const win_height = window.innerHeight;
        const wratio = win_width / win_height;
        const canvas_ratio = canvas.width / canvas.height;

        if (wratio < canvas_ratio) {
            canvas.style.width = win_width + "px";
            canvas.style.height = (win_width / canvas_ratio) + "px";
        } else {
            canvas.style.width = (win_height * canvas_ratio) + "px";
            canvas.style.height = win_height + "px";
        }
    }
}

export default Resizer;