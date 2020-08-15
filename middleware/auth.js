//Login User
const login = async function (email, password) {
	if (email != '' && password != '') {
		firebase
			.auth()
			.signInWithEmailAndPassword(email, password)
			.then((result) => {
				//console.log(result);
				//this.props.navigation.replace('HomeScreen');
				if (result) {
					console.log('logged in');
				}
			})
			.catch((error) => alert(error));
	} else {
		alert('Provide information');
	}
};

//Register User
const register = async function (email, password, password2) {
	if (
		email != '' &&
		password != '' &&
		password2 != '' &&
		password == password2
	) {
		firebase
			.auth()
			.createUserWithEmailAndPassword(email, password)
			.then((result) => {
				console.log('signed up');
			})
			.catch((error) => alert(error));
	} else {
		alert('Please provide valid credentials');
	}
};
