function test(argument) {
	// let err = new Error('this is error');
	//err.code = 100;
	throw {err: new Error('this is error'), code: 100};
}

try {
	test();
} catch (err) {
	console.log(err);
}