import {h} from 'muve';

export const indexPage = model => (
	<main class="title">
		<h2 style={{color: 'purple'}}>{model.title}</h2>
		<ul>
			{model.todos.map(todo => (
				<li style={{color: 'green'}} onClick={() => console.log('hit')}>
					{todo}
				</li>
			))}
		</ul>
	</main>
);
