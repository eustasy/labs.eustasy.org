<?php include __DIR__.'/../_templates/header.php'; ?>

		<style>
			h1 { font: 300 3em/1 'Lato', sans-serif; text-transform: uppercase; margin-bottom: -.5rem; }
			h2 { font: 300 2em/1 'Open Sans', sans-serif; text-transform: uppercase; }
			body { font: 300 1em/1 'Nunito', sans-serif; padding: 1rem 1rem 1rem 3rem; }
			b, strong { font-weight: 400; }
			p { text-align: justify; }
			img { max-height: 100vh; max-width: 100vw; }
			.float-left { float: left; }
			.float-right { float: right; }
			.shaped { shape-outside: polygon(30% 0, 100% 0, 100% 100%, 8% 100%); margin: -1rem; }
			a { text-decoration: none; }
			a:hover { text-decoration: underline; }
			@media screen and (min-width: 80rem) { body { padding-left: 30vw; } }
		</style>

	</head>
	<body>

		<img class="shaped float-right" src="eiffel-tower_compressed.jpg" />

		<h1>La Tour Eiffel</h1>
		<h2>The Eiffel Tower</h2>
		<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc justo massa, mattis in imperdiet in, pellentesque sit amet elit. Fusce vitae pulvinar nisi. Ut sed justo nec est congue cursus vestibulum eu dolor. Donec at mauris felis, sit amet ultrices odio. Aliquam erat volutpat. Nullam faucibus metus eu elit luctus sed malesuada risus molestie. Mauris nulla quam, tristique at lobortis at, fringilla quis nibh. Ut sapien mauris, imperdiet eget tincidunt semper, consectetur a augue. Donec vitae nibh augue, ut rhoncus elit. Nullam volutpat lorem sed odio lacinia non aliquet erat consequat. In ac libero turpis. In commodo nisl id diam dapibus varius. Sed lobortis ultricies ligula, quis auctor arcu imperdiet eget. Donec vel ipsum dui. In justo purus, molestie sit amet mattis sed, cursus non orci. Nullam ac massa vel tortor scelerisque blandit quis a sapien.</p>
		<p>Morbi ipsum massa, commodo in auctor a, tincidunt et nisl. In hac habitasse platea dictumst. Fusce molestie, leo ut pellentesque posuere, dui nunc dignissim massa, non aliquet felis sem nec nisl. In pellentesque condimentum tellus, sed hendrerit dolor porttitor vel. Nam dapibus urna a sem semper non porttitor nulla varius. Morbi libero metus, dictum vel viverra aliquet, fringilla vitae tellus. Maecenas ac libero mauris. Pellentesque vitae urna erat, lobortis venenatis ipsum. Ut nec gravida arcu. Suspendisse at risus nulla. Vivamus dictum tempus enim at pellentesque. Curabitur ac tellus ligula, non tristique risus. Nunc vitae ipsum nec libero consectetur tincidunt nec eu nisl. Fusce odio nisi, hendrerit nec aliquam in, dignissim et magna. Nullam tempor condimentum ligula vel cursus. Pellentesque ut sapien at ligula pellentesque congue ut ut turpis.</p>
		<!-- ignore http:// --><p>Uses <strong>shape-outside</strong>. <span class="color-pomegranate">Warning!</span> <a class="color-belize-hole" target="_blank" href="http://caniuse.com/#search=shape-outside">Not well supported.</a></p>

	</body>
</html>
