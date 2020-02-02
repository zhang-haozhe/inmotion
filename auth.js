//Login User
const login = async function(email, password) {
	const config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	const body = JSON.stringify({ email, password });
	try {
		var token = '';
		const res = await axios
			.post('http://localhost:8080/api/auth', body, config)
			.then(response => {
				token = response.data.token;
				document.cookie = `token=${token}`;
				window.location = 'http://127.0.0.1:8080/index.html';
			});
	} catch (err) {
		const errors = err.response.data.errors;
		console.log(errors);
	}
};

//Register User
const register = async function(name, email, password) {
	const config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	const body = JSON.stringify({ name, email, password });

	try {
		var token = '';
		const res = await axios
			.post('http://localhost:8080/api/users', body, config)
			.then(response => {
				token = response.data.token;
				document.cookie = `token=${token}`;
				window.location = 'http://127.0.0.1:8080/index.html';
			});
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach(error => console.log(error));
		}
	}
};
