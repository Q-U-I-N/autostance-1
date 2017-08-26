module.exports = {
	5: {
		job: 'Archer',
		desc:['Sniper`s Eye II'],
		id:[210200],
		abnormalities:[[601131,601133,601101]]
	},
	0: {
		job: 'Warrior',
		desc: ['Assault Stance IV','Defensive Stance IV'],
		hasAlternativeStance:true,
		defaultStance:1,
		stamina:1000, // RE
		id:[80400,90400],
		abnormalities:[[100103,100150],[100203,100297,100298,100299,100296]]
	},
	isExists: function(classId) {
		if(this[classId] !== undefined ) {
			return true;
		}
		return false;
	}
}
