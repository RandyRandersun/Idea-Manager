'use strict';

class ProjectInstance extends HTMLDivElement {
  
	constructor(projectName, rest) {
		super();
		this.projectName = projectName;
		this.rest = rest;
		this.collapsed = true;
		
		this.handleAddNote = this.handleAddNote.bind(this);
		this.populateView = this.populateView.bind(this);
		this.handleDeleteProject = this.handleDeleteProject.bind(this);
		this.toggleCollapse = this.toggleCollapse.bind(this);
		this.delayedNotepadAppend = this.delayedNotepadAppend.bind(this);
		this.delayedResetSize = this.delayedResetSize.bind(this);
		this.delayedColor = this.delayedColor.bind(this);
		this.delayedRemove = this.delayedRemove.bind(this);
		this.toggleCollapseOpen = this.toggleCollapseOpen.bind(this);
		this.toggleCollapseClosed = this.toggleCollapseClosed.bind(this);
		
		this.setStyleSelected = this.setStyleSelected.bind(this);
		this.setStyleNoSelected = this.setStyleNoSelected.bind(this);
	}
  
	connectedCallback() {
		const template = document.getElementById('projectInstance');
		const node = document.importNode(template.content, true);
		this.appendChild(node);
		
		let thisCollapseLink = this.querySelector("#toggle-collapse-link");
		thisCollapseLink.textContent = this.projectName;
		thisCollapseLink.setAttribute('title-text',this.projectName);
		
		this.classList.add("project-instance");
		this.id = (this.projectName +"projectInstance");
		
		if(typeof window.collapsedStates[this.projectName] === "undefined"){
			window.collapsedStates[this.projectName] = true;
		}
		if(window.collapsedStates[this.projectName]){
			this.querySelector("#ideaContainer").style.display = 'none';
			this.style.maxHeight = (25+this.rest.ideas.length*26)+"px";
		}
		
		this.querySelector("#addNoteButton").addEventListener('click',this.handleAddNote);
		this.querySelector("#deleteProjectButton").addEventListener('click',this.handleDeleteProject);
		this.querySelector("#toggle-collapse-link").addEventListener('click',this.toggleCollapse);
		
		this.populateView();
	}
  
	disconnectedCallback() {
		this.querySelector("#addNoteButton").removeEventListener('click',this.handleAddNote);
		this.querySelector("#toggle-collapse-link").removeEventListener('click',this.toggleCollapse);
	}
	
	setStyleSelected(index){
		let thisCollapseLink = this.querySelector(".toggle-collapse-link");
		let selectedColor = getComputedStyle(thisCollapseLink).getPropertyValue("--selected-idea-shadow");
		
		thisCollapseLink.classList.add('selected-project');
		thisCollapseLink.style.color = 'rgba('+selectedColor+', 1 )';
		thisCollapseLink.style.transition = '';
		thisCollapseLink.style.textShadow = '2px 2px rgba(255,255,255,.2)';
		
		let thisVertPointActive = this.querySelector(".directory-vertical-point-active");
		thisVertPointActive.style.height = (10+index*23+6+2)+"px";
		thisVertPointActive.style.opacity = "1";
		
		let curVerticalPoint = this.querySelector(".directory-vertical-point");
		curVerticalPoint.style.boxShadow = "2px 2px rgba("+selectedColor+", 1 )";
		curVerticalPoint.style.opacity = '0.5';
		
		let ideaInstances;
		if( window.collapsedStates[this.projectName] ){
			ideaInstances = Array.from(this.querySelectorAll(".idea-instance-close"));
		}
		else{
			ideaInstances = Array.from(this.querySelectorAll(".idea-instance"));
		}

		for (var idea in ideaInstances){
			let curOpenIdea = document.querySelector("#"+this.id+" #"+ideaInstances[idea].id+" .open-idea-link");
			let currHorizontalPoint = document.querySelector("#"+this.id+" #"+ideaInstances[idea].id+" .directory-horizontal-point");
			currHorizontalPoint.style.transition = "border-top .5s linear 0s";
			if(ideaInstances[idea].index === index){
				curOpenIdea.classList.add('selected-idea')
				curOpenIdea.style.color = 'rgba('+selectedColor+', 1 )';
			}
			else{
				curOpenIdea.classList.remove('selected-idea');
				curOpenIdea.style.color = 'White';
				currHorizontalPoint.style.borderTop = "3px solid rgba("+selectedColor+", 1 )";
			}
		}
	}
	setStyleNoSelected(){
		let thisCollapseLink = this.querySelector(".toggle-collapse-link");
		let selectedColorHighlight = getComputedStyle(thisCollapseLink).getPropertyValue("--collapse-status-open-highlight");
		let selectedColor = getComputedStyle(thisCollapseLink).getPropertyValue("--selected-idea-shadow");
		
		thisCollapseLink.classList.remove('selected-project');
		thisCollapseLink.style.color = "White";
		
		let curVerticalPoint = this.querySelector(".directory-vertical-point");
		if( !window.collapsedStates[this.projectName] ){
			thisCollapseLink.style.textShadow = '2px 2px rgba('+selectedColorHighlight+', 0.5 )';
			curVerticalPoint.style.boxShadow = "2px 2px rgba("+selectedColorHighlight+", 1 )";
			curVerticalPoint.style.opacity = "1";
		}
		else{
			thisCollapseLink.style.textShadow = '2px 2px rgba(255,255,255,.5)';
			curVerticalPoint.style.boxShadow = "3px 3px rgba("+selectedColor+", 1 )";
			curVerticalPoint.style.opacity = ".5";
		}
		
		let curVerticalPointActive = this.querySelector(".directory-vertical-point-active");	
		curVerticalPointActive.style.transition = '';
		curVerticalPointActive.style.opacity = '0';
		curVerticalPointActive.style.height = '0px';
		
		let ideaInstances;
		if( window.collapsedStates[this.projectName] ){
			ideaInstances = Array.from(this.querySelectorAll(".idea-instance-close"));
		}
		else{
			ideaInstances = Array.from(this.querySelectorAll(".idea-instance"));
		}

		for (var idea in ideaInstances){
			let curOpenIdea = document.querySelector("#"+this.id+" #"+ideaInstances[idea].id+" .open-idea-link");
			let currHorizontalPoint = document.querySelector("#"+this.id+" #"+ideaInstances[idea].id+" .directory-horizontal-point");
			currHorizontalPoint.style.transition = "border-top .5s linear 0s";
			curOpenIdea.classList.remove('selected-idea');
			
			if( window.collapsedStates[this.projectName] ){
				currHorizontalPoint.style.borderTop = "3px solid rgba("+selectedColor+", 1 )";
				curOpenIdea.style.color = 'rgba('+selectedColor+', 1 )';
			}
			else{
				currHorizontalPoint.style.borderTop = "3px solid rgba("+selectedColorHighlight+", 1 )";
				curOpenIdea.style.color = 'White';
			}
		}
	}
	
	delayedRemove(){
		this.remove();
	}
	
	handleDeleteProject(){
		window.localStorage.removeItem(this.projectName);
		delete document.querySelector('.directory-instance').db[this.projectName];
		if(!window.collapsedStates[this.projectName]){
			this.toggleCollapse();
			this.style.animation = "fadeOutProject 800ms 400ms linear forwards";
			setTimeout(this.delayedRemove,1200);
		}
		else{
			this.style.animation = "fadeOutProject 800ms 0ms linear forwards";
			setTimeout(this.delayedRemove,800);
		}
	}
	
	delayedResetSize(){
		let ideaContainerElm = this.querySelector("#ideaContainer");
		ideaContainerElm.style.display = 'none'; 
		
		let thisVertPoint = this.querySelector('.directory-vertical-point');
		thisVertPoint.style.transition = '';
		thisVertPoint.style.height = '0px';
		thisVertPoint.style.animation = '';
		thisVertPoint.style.transition = "box-shadow 0.5s linear 0s";
		
		
		this.style.transition = 'all 0.3s linear';
		
		let thisVertPointActive = this.querySelector(".directory-point-wrapper .directory-vertical-point-active");
		thisVertPointActive.style.height = '0px'; 
		thisVertPointActive.style.opacity = '0'; 
		thisVertPointActive.style.animation = '';
	}
	
	delayedColor(){
		let currVerticalPoint = this.querySelector(".directory-point-wrapper .directory-vertical-point");
		let selectedColorHighlight = getComputedStyle(currVerticalPoint).getPropertyValue("--collapse-status-open-highlight");
		let selectedColor = getComputedStyle(currVerticalPoint).getPropertyValue("--selected-idea-shadow");
		let selectedColorAnimate = getComputedStyle(currVerticalPoint).getPropertyValue("--selected-idea-animate");
		
		currVerticalPoint.style.transition = "box-shadow .5s linear 0s";
		currVerticalPoint.style.opacity = "1";
		
		let selectedItemExists = (this.querySelector('.selected-idea') !== null);
		if(!selectedItemExists){
			currVerticalPoint.style.boxShadow = "2px 2px rgba("+selectedColorHighlight+", 1 )";
		}
		
		let toggleCollapseLink = this.querySelector('.toggle-collapse-link');
		toggleCollapseLink.style.transition = 'all .5s linear';
		toggleCollapseLink.style.textShadow = '2px 2px rgba('+selectedColorHighlight+', 0.5 )';
		
		let ideaInstances = Array.from(this.querySelectorAll(".idea-instance"));
		for (var idea in ideaInstances){
			let currIdeaLink = this.querySelector("#"+ideaInstances[idea].id+" .open-idea-link");
			currIdeaLink.style.transition = "filter 1s linear .5s,color 1s linear .5s";
			currIdeaLink.style.filter = "drop-shadow(0 0 .2rem rgba("+selectedColor+", 1 ))";
			currIdeaLink.style.color = "White";
			
			let currHorizontalPoint = this.querySelector('#'+ideaInstances[idea].id+" .directory-horizontal-point");
			currHorizontalPoint.style.transition = "border-top 0.5s linear 0s";
			
			if(selectedItemExists){
				currHorizontalPoint.style.borderTop = "3px solid rgba("+selectedColor+", 1 )";
			}
			else{
				currHorizontalPoint.style.borderTop = "3px solid rgba("+selectedColorHighlight+", 1 )";
			}
			
			if(currIdeaLink.classList.contains('selected-idea')){
				let ideaInstance = this.querySelector("#"+ideaInstances[idea].id);
				this.setStyleSelected(ideaInstance.index);
				currIdeaLink.style.color = "rgba("+selectedColor+", 1 )";
				currHorizontalPoint.style.borderTop = "3px solid rgba("+selectedColorAnimate+", 0.8 )";
			}
		}
	}
	
	toggleCollapseClosed(){
		if(window.collapsedStates[this.projectName]){
			this.toggleCollapse();
		}
	}
	
	toggleCollapseOpen(){
		if(window.collapsedStates[this.projectName]){
			this.toggleCollapse();
		}
	}
	
	toggleCollapse(optionalDontToggle){
		if(this.rest.ideas.length === 0 ){
			return;
		}
		
		if(optionalDontToggle !== true){
			window.collapsedStates[this.projectName] = !window.collapsedStates[this.projectName];
		}

		let ideaContainerElm = this.querySelector("#ideaContainer");
		
		let thisVertPoint = this.querySelector(".directory-point-wrapper .directory-vertical-point");
		let selectedColor = getComputedStyle(thisVertPoint).getPropertyValue("--selected-idea-shadow");

		if(window.collapsedStates[this.projectName]){
			this.classList.remove('project-instance-open');
			this.classList.add('project-instance');
			
			thisVertPoint.style.transition = "";
			thisVertPoint.style.boxShadow = "3px 3px rgba("+selectedColor+", 1 )";
			
			let stylesheetAnimation = "slideUp 200ms 0ms linear forwards";
			thisVertPoint.style.animation = stylesheetAnimation;
			
			let thisVertPointActive = this.querySelector('.directory-vertical-point-active');
			thisVertPointActive.style.animation = stylesheetAnimation;
				
			let toggleCollapseLink = this.querySelector('.toggle-collapse-link');
			if(!toggleCollapseLink.classList.contains('selected-project')){
				toggleCollapseLink.style.transition = "";
				toggleCollapseLink.style.textShadow = '2px 2px rgba(255,255,255,.5)';
			}
			
			let ideaInstances = Array.from(this.querySelectorAll(".idea-instance"));
			
			let duration = this.rest.ideas.length * 25;

			for (var idea in ideaInstances){
				
				let currIdeaLink = this.querySelector("#"+ideaInstances[idea].id+" #open-idea-link");
				currIdeaLink.style.filter = "";
				currIdeaLink.style.transition = "";
				currIdeaLink.style.color = "rgba("+selectedColor+", 1 )";
				
				let currHorizontalPoint = this.querySelector("#"+ideaInstances[idea].id+" .directory-point-wrapper .directory-horizontal-point");
				currHorizontalPoint.style.borderTop = "3px solid rgba("+selectedColor+", 1 )";
			
				ideaInstances[idea].classList.remove('idea-instance');
				ideaInstances[idea].classList.add('idea-instance-close');
				
				let ideaStylesheetAnimation = "slideUp 350ms 0ms linear forwards";
				ideaInstances[idea].style.animation = ideaStylesheetAnimation;
				
				let duration = this.rest.ideas.length * 25;
				this.style.transition = ('all '+duration+ 'ms 200ms linear');
				this.style.maxHeight = "25px";
			}
			setTimeout(this.delayedResetSize, duration+200);
		}
		else{
			ideaContainerElm.style.display = 'block';
			
			if(!window.collapsedStates[this.projectName]){
				this.style.maxHeight = (25+this.rest.ideas.length*26)+"px";
			}

			this.classList.remove('project-instance');
			this.classList.add('project-instance-open');
			
			
			let ideaInstances = Array.from(this.querySelectorAll(".idea-instance-close"));
			for (var idea in ideaInstances){
				ideaInstances[idea].classList.remove('idea-instance-close');
				ideaInstances[idea].classList.add('idea-instance');
				
				let timeout = idea * 30;
				let stylesheetAnimation = "slideDown 200ms "+ timeout + "ms linear forwards";
				ideaInstances[idea].style.animation = stylesheetAnimation;
			}
			
			thisVertPoint.style.display = 'inline-block';
			thisVertPoint.style.transition = "height "+(this.rest.ideas.length*50+100)+"ms ease-in-out";
			thisVertPoint.style.height = (10+(this.rest.ideas.length-1)*23+6)+"px";
			
			setTimeout(this.delayedColor, (this.rest.ideas.length*50+100));
		}
	}
	
	delayedNotepadAppend(newIdeaElm){
		newIdeaElm.handleNotepadSwap();
	}
	
	handleAddNote(){
		let newIdeaObj = {
			ideaName: "new_Idea",
			ideaText: "..."
		}
		let rest = JSON.parse(window.localStorage.getItem(this.projectName));
		rest.ideas.push(newIdeaObj);
		window.localStorage.setItem(this.projectName, JSON.stringify(rest));
		this.rest = rest;
		document.querySelector('.directory-instance').updateSearchSpace(this.projectName, rest);
		
		//remove animation so we can change max height without slidingUp; only remove if it is currently expanded
		if( !window.collapsedStates[this.projectName] ){
			let ideaInstances = Array.from(this.querySelectorAll(".idea-container"));
			for (var idea in ideaInstances){
				ideaInstances[idea].style.animation == '';
			}
			
			this.querySelector('.directory-vertical-point').style.transition = "maxHeight "+(200)+"ms linear";
			this.style.maxHeight = (25+this.rest.ideas.length*26)+"px";
			setTimeout(this.toggleCollapse(true),100);
		}
		else{
			this.toggleCollapse(false);
		}
		
		let container = this.querySelector("#ideaContainer");
		let newIdea = new IdeaInstance(this.projectName, newIdeaObj,this.rest.ideas.length-1);
		
		let stylesheetAnimation = "slideDownNew 200ms 0ms linear forwards";
		newIdea.style.animation = stylesheetAnimation;

		container.appendChild(newIdea);
		container.style.display = 'block';
		
		this.querySelector(".idea-instance-close").className = 'idea-instance';
		setTimeout(this.delayedNotepadAppend(newIdea), 250);
	}
	
	populateView(){
		let container = this.querySelector("#ideaContainer");
		for (var idea in this.rest.ideas) {
			container.appendChild(new IdeaInstance(this.projectName, this.rest.ideas[idea], idea, window.collapsedStates[this.projectName]));
		}
	}
}

customElements.define('project-instance', ProjectInstance, { extends: "div" });