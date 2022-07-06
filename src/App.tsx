import { usePersistentItem } from "./hooks/usePersistentItem";
import { createPersistentItem, IPersistentItem } from "./lib/createPersistentItem";
import { PersistenceStrategy } from "./lib/PersistenceStrategy";

function Counter(props: { item: IPersistentItem<number>, label: string }) {
	const clicks = usePersistentItem(props.item);
	return <div style={{ display: "flex", gap: "1rem" }}>
		<p style={{ width: "12rem" }}>
			{props.label}
		</p>
		<button onClick={() => props.item.update(current => (current ?? 0) + 1)}>
			Clicked {clicks ?? 0} times
		</button>
		<button onClick={() => props.item.set(5)}>
			Set to 5
		</button>
		<button onClick={() => props.item.clear()}>
			Reset
		</button>
	</div>
}

function App() {
	return (
		<div className="App" style={{ padding: "6rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
			<Counter item={localStorageClicks} label="Local storage 1" />
			<Counter item={localStorageClicks} label="Local storage 2" />
			<Counter item={sessionStorageClicks} label="Session storage 1" />
			<Counter item={sessionStorageClicks} label="Session storage 2" />
			<Counter item={serverClicks} label="Server 1" />
			<Counter item={serverClicks} label="Server 2" />
		</div>
	);
}

// Store integer of how many times a button was clicked in session storage
const sessionStorageClicks = createPersistentItem<number>({
	key: "clicks",
	validate: (t: any): t is number => typeof t === "number" && t >= 0,
	persistenceStrategy: PersistenceStrategy.SessionStorage
})

// Store integer of how many times a button was clicked in local storage
const localStorageClicks = createPersistentItem<number>({
	key: "clicks",
	validate: (t: any): t is number => typeof t === "number" && t >= 0,
	persistenceStrategy: PersistenceStrategy.LocalStorage
})

// Store integer of how many times a button was clicked on server
const serverClicks = createPersistentItem<number>({
	key: "clicks",
	validate: (t: any): t is number => typeof t === "number" && t >= 0,
	persistenceStrategy: PersistenceStrategy.Server
})


export default App;