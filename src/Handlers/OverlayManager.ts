import { DiagReader } from "../pages/dialogsolver";
export class OverlayManager extends DiagReader {
	constructor() {
		super();
		this.displayOverlay = this.displayOverlay.bind(this);
	}

	public async displayOverlay(coordX: number, coordY: number) {
		// Display the overlay initially
		alt1.overLayText(``, this.color, 12, coordX, coordY, 2000);
		alt1.overLayRect(
			this.color,
			coordX - 30,
			coordY - 16,
			this.diagW / 2 - 80,
			this.diagH / 2 - 30,
			2000,
			3
		);

		return new Promise<void>((resolve) => {
			const checkHovered = () => {
				if (this.isHovered) {
					resolve();
				} else {
					setTimeout(checkHovered, 100);
				}
			};

			checkHovered();
		});
	}

	async processKeys(keys: string[]) {
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const [x, y] = key.split(",").map(Number);
			await this.displayOverlay(x, y);
		}
	}

	// Other methods and properties
}
