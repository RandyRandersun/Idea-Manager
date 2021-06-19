window.collapsedStates = {};

function populationManager(){
	//Populate the left directory with a new instance
	document.getElementById('leftSidebar').appendChild(new DirectoryInstance());
	
	//do landing page here whatever that is
}
document.addEventListener('DOMContentLoaded', populationManager, false);


