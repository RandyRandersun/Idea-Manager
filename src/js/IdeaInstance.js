'use strict';

class IdeaInstance extends HTMLLIElement {
  
	constructor(projectTitle,title, index) {
		super();
		
		this.projectTitle = projectTitle;
		this.title = title["ideaName"];
		this.notepadText = title["ideaText"];
		this.setAttribute('title-text',this.title);
		this.index = index;
		this.id = (this.title+"R-"+this.index+"DirectoryInstance");
		this.classList.add('idea-instance-close');

		// Calculate delay and Set animation 
		var timeout = this.index * 30;
		var stylesheetAnimation = "slideDown 200ms "+ timeout + "ms linear forwards";
		this.style.animation = stylesheetAnimation;
		

		this.handleNotepadSwap = this.handleNotepadSwap.bind(this);
		this.handleDeleteNote = this.handleDeleteNote.bind(this);
		this.delayedRemove = this.delayedRemove.bind(this);
		this.delayedResize = this.delayedResize.bind(this);
		this.toggleDeleteButton = this.toggleDeleteButton.bind(this);
		this.setDeleteAnimation = this.setDeleteAnimation.bind(this);
	}
  
	connectedCallback() {
		const template = document.getElementById('ideaInstance');
		const node = document.importNode(template.content, true);
		this.appendChild(node);
		
		// Set Display Text
		let openIdeaLink = this.querySelector("#open-idea-link");
		openIdeaLink.textContent = this.title;
		
		
		openIdeaLink.addEventListener('click',this.handleNotepadSwap);
		this.querySelector("#deleteNote").addEventListener('click',this.handleDeleteNote);
	}
  
	disconnectedCallback() {
		this.querySelector("#open-idea-link").removeEventListener('click',this.handleNotepadSwap);
		this.querySelector("#deleteNote").removeEventListener('click',this.handleDeleteNote);
	}
	
	//Need to colapse the window if we deleted the last idea in the project
	delayedResize(){
		document.querySelector("#"+this.projectTitle+"projectInstance .idea-container").style.display = 'none';
		let thisVerticalPoint = document.querySelector("#"+this.projectTitle+"projectInstance .directory-vertical-point");
		thisVerticalPoint.style.transition = '';
		thisVerticalPoint.style.height = '0px';
		thisVerticalPoint.style.animation = '';
		this.delayedRemove();
	}
	
	delayedRemove(){
		//Reset button to active; called after animation is finished
		let ideaInstances = Array.from(document.querySelectorAll("#"+this.projectTitle+"projectInstance .idea-instance"));
		for( var idea in ideaInstances ){
			ideaInstances[idea].toggleDeleteButton(false);
		}
		this.remove();
	}
	
	toggleDeleteButton(toggle){
		this.querySelector('.delete-note-button').disabled = toggle;
	}
	
	setDeleteAnimation(){
		let rest = document.querySelector("#"+this.projectTitle+"projectInstance").rest;
		document.querySelector("#"+this.projectTitle+"projectInstance").style.maxHeight = (25+(rest.ideas.length)*26)+"px";
		setTimeout(this.delayedRemove , 200);
	}
	
	
	handleDeleteNote(){
		//remove from db
		let container = document.querySelector("#project-container");
		let rest = JSON.parse(window.localStorage.getItem(this.projectTitle));
		rest.ideas.splice(this.index,1);
		let thisProjectInstance = document.querySelector("#"+this.projectTitle+"projectInstance");
		thisProjectInstance.rest = rest;
		window.localStorage.setItem(this.projectTitle, JSON.stringify(rest));
		let thisDirectoryInstance = document.querySelector('.directory-instance');
		thisDirectoryInstance.updateSearchSpace(this.projectTitle,rest);
		
		//Set animation properties
		let thisHorizPoint = this.querySelector(".directory-point-wrapper .directory-horizontal-point");
		thisHorizPoint.style.animation = '';
		thisHorizPoint.style.transition = "";
		thisHorizPoint.style.display = "none";
		
		let thisIdeaLink = this.querySelector("#open-idea-link");
		thisIdeaLink.style.filter = "";
		thisIdeaLink.style.transition = "";
		thisIdeaLink.style.color = "Grey";
		
		if(thisIdeaLink.classList.contains('selected-idea')){
			thisProjectInstance.setStyleNoSelected();
		}
		
		let stylesheetAnimation = "fadeOut 300ms 0ms linear forwards";
		this.style.animation = stylesheetAnimation;
		
		let thisVertPoint = document.querySelector("#"+this.projectTitle+"projectInstance .directory-vertical-point");
		let thisVertPointActive = document.querySelector("#"+this.projectTitle+"projectInstance .directory-vertical-point-active");
		
		//Need to collapse project if we deleted the last idea; else remove it
		if(rest.ideas.length == 0){
			let stylesheetAnimation = "slideUp 350ms 0ms linear forwards";
			thisVertPoint.style.animation = stylesheetAnimation;
			thisVertPoint.style.boxShadow = "3px 3px #888888";
			
			let thisCollapseLink = document.querySelector("#"+this.projectTitle+"projectInstance .toggle-collapse-link");
			thisCollapseLink.style.transition = "";
			thisCollapseLink.style.textShadow = '2px 2px rgba(255,255,255,.5)';
			
			setTimeout(this.delayedResize,400);
		}
		else{
			thisVertPoint.style.transition = ("height "+(150)+"ms 150ms linear");
			thisVertPoint.style.height =(10+(rest.ideas.length-1)*23+6)+"px";

			let currSelectedIdea = document.querySelector("#"+this.projectTitle+"projectInstance .selected-idea");
			if(currSelectedIdea !== null && this.index < currSelectedIdea.parentNode.index){
				thisVertPointActive.style.transition = ("height "+(150)+"ms 150ms linear");
				thisVertPointActive.style.height = (10+(currSelectedIdea.parentNode.index-1)*23+6+2)+"px";
				thisVertPointActive.style.opacity = "1";
			}
			
			setTimeout(this.setDeleteAnimation,300);
		}
		
		//If the removed idea's notepad is open, remove it
		let currActiveNotepad = document.querySelector('#rightTextArea .notepad-instance');
		if( currActiveNotepad != null && currActiveNotepad.id === (this.projectTitle + "-" + this.title + "-" + this.index) ){
			let rightTextArea = document.getElementById('rightTextArea');
			rightTextArea.innerHTML = '';
		}
		
		let ideaInstances = Array.from(document.querySelectorAll("#"+this.projectTitle+"projectInstance .idea-instance"));
		let currentIndex = 0;
		for( var idea in ideaInstances ){
			ideaInstances[idea].toggleDeleteButton(true);
			
			// If a notepad other than this one is open, we need to reindex it to match the directory instance counterpart
			if( currActiveNotepad != null && currActiveNotepad.id === this.projectTitle +"-"+this.title+"-"+ideaInstances[idea].index ){
				currActiveNotepad.index = currentIndex;
				currActiveNotepad.id = this.projectTitle + "-" + this.title + "-" + currentIndex;
			}
			
			// Reindex the directory
			if(ideaInstances[idea].id !== this.id){
				ideaInstances[idea].id = (ideaInstances[idea].title+"R-"+currentIndex+"DirectoryInstance");
				ideaInstances[idea].index = currentIndex;
				currentIndex++;
			}
		}
	}
	
	
	handleNotepadSwap(e){
		let rightArea = document.getElementById('rightTextArea');
		rightArea.innerHTML = '';
		rightArea.appendChild(new NotepadInstance(this.projectTitle, this.title, this.notepadText, this.index));
		
		let thisIdeaLink = this.querySelector('.open-idea-link');
		thisIdeaLink.style.transition = '.5s all linear';
		
		let thisHorizPoint = this.querySelector(".directory-point-wrapper .directory-horizontal-point");
		thisHorizPoint.style.borderTop = "3px solid rgba(209,36,124,.8)";
		
		let projectInstances = Array.from(document.querySelectorAll('.directory-instance #project-container > div'));
		for (var project in projectInstances){
			let currProjectInstance = document.querySelector("#"+projectInstances[project].id);
			
			if(projectInstances[project].id !== this.projectTitle+"projectInstance"){
				currProjectInstance.setStyleNoSelected();
			}
			else{
				currProjectInstance.setStyleSelected(this.index);
			}
		}
	}
}

customElements.define('idea-instance', IdeaInstance, { extends: "li" });