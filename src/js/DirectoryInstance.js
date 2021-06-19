'use strict';

class DirectoryInstance extends HTMLDivElement {
  
	constructor() {
		super();
		
		this.handleAddProject = this.handleAddProject.bind(this);
		this.populateView = this.populateView.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.handleSave = this.handleSave.bind(this);
		this.handleKeydown = this.handleKeydown.bind(this);
		this.updateSearchSpace = this.updateSearchSpace.bind(this);
		this.handleSearchKeyup = this.handleSearchKeyup.bind(this);
		this.findMatches = this.findMatches.bind(this);
		
		this.db = {};
		
	}
  
	connectedCallback() {
		const template = document.getElementById('directoryInstance');
		const node = document.importNode(template.content, true);
		this.appendChild(node);

		this.className = 'directory-instance';

		document.querySelector(".add-project-button").addEventListener('click',this.handleAddProject);
		document.querySelector(".cancel-button-modal").addEventListener('click',this.handleCancel);
		document.querySelector(".save-button-modal").addEventListener('click',this.handleSave);
		document.querySelector('#myModal .save-input-form').addEventListener('keydown',this.handleKeydown);
		document.querySelector('.top-toolbar .search-bar-area').addEventListener('keyup',this.handleSearchKeyup);
		
		this.populateView();
	}
  
	disconnectedCallback() {
		this.querySelector(".add-project-button").removeEventListener('click',this.handleAddProject);
		document.querySelector(".cancel-button-modal").removeEventListener('click',this.handleCancel);
		document.querySelector(".save-button-modal").removeEventListener('click',this.handleSave);
		document.querySelector('#myModal .save-input-form').removeEventListener('keydown',this.handleKeydown);
		document.querySelector('.top-toolbar .search-bar-area').removeEventListener('keyup',this.handleSearchKeyup);
	}
	
	//updates memory to be searched from
	updateSearchSpace(projectTitle, rest){
		const { ipcRenderer } = require('electron');
		ipcRenderer.send('asynchronous-message', this.db);
		this.db[projectTitle] = rest;
	}
	
	//Close out of modal; Reset state of modal
	handleCancel(){
		document.querySelector('#myModal').style.display = "none";
		document.querySelector('#myModal .save-input-form').value = '';
		document.querySelector('#myModal #errorText').innerHTML = '';
	}
	
	handleKeydown(e){
		//The first char CANNOT be a number
		if(document.querySelector('#myModal .save-input-form').value == '' &&  isFinite(event.key)){
			e.preventDefault();
		}
		//Enter attemps to save
		else if(e.key === 'Enter'){
			this.handleSave();
		}
		//Space replaced with _
		else if(e.key == " "){
			e.preventDefault();
			document.querySelector('#myModal .save-input-form').value = document.querySelector('#myModal .save-input-form').value +"_";
		}
		//Only numbers, letters, and _ -
		else if((/^[a-z0-9]+$/i).test(e.key) || e.key == "_" || e.key == "-" ){
			
		}
		//Else dont let it type
		else{
			e.preventDefault();
		}
	}
	
	handleSave(){
		//Project needs a name
		let errorText = document.querySelector('#myModal #errorText');
		
		let inputForm = document.querySelector('#myModal .save-input-form');
		let newProjectTitle = inputForm.value;
		if(newProjectTitle == ''){
			errorText.innerHTML = "Enter a project name...";
			return;
		}
		
		//Check for duplicate project names; dont allow duplicate project names
		if(window.localStorage.getItem(newProjectTitle) !== null){
			errorText.innerHTML = "Name taken! Choose another";
			return;
		}
		
		let projectObj = {
			ideas: []
		};
		
		window.localStorage.setItem(newProjectTitle, JSON.stringify(projectObj) );
		
		let rest = window.localStorage.getItem(newProjectTitle);
		let newProjectElm = new ProjectInstance(newProjectTitle,JSON.parse(rest));
		newProjectElm.setAttribute('title-text',newProjectTitle);
		
		// Find out the index of the new project in the database
		let index = window.localStorage.length;
		for( var i = 0; i<window.localStorage.length; ++i ){
			let projectName = window.localStorage.key(i);
			if(projectName === newProjectTitle){
				index = i;
				break;
			}
		}
		
		let projectInstances = this.querySelectorAll("#project-container .project-instance");
		this.querySelector("#project-container").insertBefore(newProjectElm, projectInstances[index]);
		
		

		this.db[newProjectTitle] = JSON.parse(rest);
		this.querySelector('#'+ newProjectTitle + 'projectInstance').handleAddNote();
		
		//Reset state of modal
		document.querySelector('#myModal').style.display = 'none';
		document.querySelector('#myModal .save-input-form').value = '';
		document.querySelector('#myModal #errorText').innerHTML ='';
	}
	
	handleAddProject(){
		document.querySelector('#myModal').style.display = "block";
		document.querySelector('#myModal .save-input-form').focus();
	}
	
	findMatches(searchStr, str ){
		var searchStrLen = searchStr.length;
		if (searchStrLen == 0) {
			return [];
		}
		var startIndex = 0, index, indices = [];

		str = str.toLowerCase();
		searchStr = searchStr.toLowerCase();

		while ((index = str.indexOf(searchStr, startIndex)) > -1) {
			indices.push(index);
			startIndex = index + searchStrLen;
		}
		return indices;
	}
	
	handleSearchKeyup(){
		document.querySelector('#rightTextArea').innerHTML = '';
		let searchString = document.querySelector('.top-toolbar .search-bar-area').value;
		
		let allMatchElms = []; 
		
		for( var key in this.db ){
			for( var idea in this.db[key].ideas ){
				let indicesName = [];
				let indicesText = [];
				if(this.db[key].ideas[idea].ideaName.length != 0 ){
					indicesName = this.findMatches(searchString, this.db[key].ideas[idea].ideaName );
				}
				if(this.db[key].ideas[idea].ideaText.length != 0 ){
					indicesText = this.findMatches(searchString, this.db[key].ideas[idea].ideaText );
				}
				if(indicesName.length != 0 || indicesText.length != 0){
					allMatchElms.push(new searchResultInstance(this.db[key].ideas[idea].ideaName,this.db[key].ideas[idea].ideaText, idea, key));
				}
			}
		}
		
		for( var elm in allMatchElms ){
			document.querySelector('#rightTextArea').appendChild(allMatchElms[elm]);
		}
	}
	
	//Populate the directory instance with the saved projects 
	populateView(){
		let container = this.querySelector("#project-container");
		container.innerHTML = '';
		for( var i = 0; i<window.localStorage.length; ++i ){
			let projectName = window.localStorage.key(i);
			let rest = window.localStorage.getItem(projectName);
			container.appendChild(new ProjectInstance(projectName,JSON.parse(rest)));
			
			this.updateSearchSpace(projectName, JSON.parse(rest) );
		}
	}
}

customElements.define('directory-instance', DirectoryInstance, { extends: "div" });