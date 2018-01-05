import {h} from '../lib/muve';

export const indexPage = model => (
	<main class="title">
		<h2>{model.title}</h2>
		<ul>
			{model.todos.map(todo => (
				<li onClick={() => console.log(`clicked ${todo}`)}>{todo}</li>
			))}
		</ul>
	</main>
);
