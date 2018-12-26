function isValid(user, mustHave=[]) {
	let err = '';
  if (mustHave!==[]) {
    mustHave.forEach( (must) => {
    	
		if (user[must.name] === undefined) {
			err += 'must have ' + must.name + '\n';
		}
		if (must.regex !== undefined && !must.regex.test(user[must.name])){
			err += must.name +' must be ' + must.regex + '\n'; 
		}
    })
  }
  return err;
}

const user1 = {
	name : "Huanyi",
	Bnumber : "B00714267"
}

const user2 = {
	id : "1234",
	name : "Huanyi",
	Bnumber : "B007142670"
}

const mustHave = [
	{name: 'id'},
	{name: 'Bnumber', regex: /^B\d{8}$/}
]
console.log(isValid(user1, mustHave))
console.log(isValid(user2, mustHave))

// console.log(/^B\d{8}$/.test("B00714267"))
// console.log(user1[mustHave[0].name] === undefined)