import {bindable} from 'aurelia-framework';
import * as createjs from 'createjs-module';

export class AnimateAdobe {
    @bindable src;
    @bindable width=800;
    @bindable height=600;
    @bindable name;//="ZelezoCelek"
    @bindable cid;//="3CC81150E735AE4485D4B0DF526EB8B4";
    @bindable fromid;

    constructor() {
      //        console.log('animate-adobe constructor()');
      this.handleValueChange = e => {
        this.handleData(e);
      };
    }

    /**
     * adds listeners to the component 'fromid' and listens to following
     * 'animatestart' starts all animation
     * 'animatestop' stops all animation
     * 'fmidata' handles data and per bind2animation structure sets animation value
     */
    bind() {
      if (this.fromid) {
        document.getElementById(this.fromid).addEventListener('animatestart', this.startAllAnimation);
        document.getElementById(this.fromid).addEventListener('animatestop', this.stopAllAnimation);
        document.getElementById(this.fromid).addEventListener('fmidata', this.handleValueChange);
      }
    }
    attached() {
      //this.adobecanvas = document.getElementById("canvas");
      //this.anim_container = document.getElementById("animation_container");
      //this.dom_overlay_container = document.getElementById("dom_overlay_container");
      //      console.log('animate-adobe attached() window.ani.adobecanvas,window.ani.anim_container,window.ani.dom_overlay_container',this.adobecanvas,this.anim_container,this.dom_overlay_container);
      //set global instance of createjs
      if (!window.createjs) window.createjs = createjs;
      //make this component global - due to further calls
      this.bindings = [];
      window.ani = this;
      //adds script in src attribute into DOM - so browser will load it, after that, initAdobe() will be called
      this.getScript(this.src, this.initAdobe);
    }

    detached() {
      //console.log('animate-adobe detached()');
      //stop animation
      window.createjs.Ticker.removeEventListener('tick', window.ani.stage);
      if (window.ani.stage) window.ani.stage.removeChildAt(0);
      //remove script
      this.removeScript(this.src);
      //destroy objects
      //window.createjs=null;
      this.bindings = [];
      window.AdobeAn = null;
      window.ani.stage = null;
    }

    removeScript(source) {
      let src = window.bdlBaseHref ? window.bdlBaseHref + source : source;
      let tags = document.getElementsByTagName('script');
      for (let i = tags.length; i >= 0; i--) { //search backwards within nodelist for matching elements to remove
        if (tags[i] && tags[i].getAttribute('src') !== null && tags[i].getAttribute('src').indexOf(src) !== -1) {tags[i].parentNode.removeChild(tags[i]);} //remove element by calling parentNode.removeChild()
      }
    }

    //get script element and registers 'onload' callback to be called when the script is loaded
    getScript(source, callback) {
      //console.log('animateadobe getscript()');
      let script = document.createElement('script');
      let prior = document.getElementsByTagName('script')[0];
      script.async = 1;
      //set that after onload a callback will be executed
      script.onerror = script.onload = script.onreadystatechange = function( _, isAbort ) {
        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
          script.onload = script.onreadystatechange = null;
          script = undefined;

          if (!isAbort && callback) setTimeout(callback, 0);
        }
      };
      //set script source - if base url is defined then base is prefixed
      script.src = window.bdlBaseHref ? window.bdlBaseHref + source : source;
      //add custom animate script into DOM - the onload will be called then
      prior.parentNode.insertBefore(script, prior);
    }

    //this is called after animate script is loaded into DOM, so global AdobeAn is available
    initAdobe() {
      //take the first composition
      if (!window.ani.cid) {
        window.ani.cid = Object.keys(window.AdobeAn.compositions)[0]; //get the first composition
      }
      window.ani.comp = window.AdobeAn.getComposition(window.ani.cid);
      //let lib=comp.getLibrary();

      //get library to manipulate and other components
      window.ani.lib = window.ani.comp.getLibrary();
      window.ani.ss = window.ani.comp.getSpriteSheet();
      window.ani.exportRoot = new window.ani.lib[window.ani.name]();
      //set stage to be bind into ref='adobecanvas' DOM element of this component
      window.ani.stage = new window.ani.lib.Stage(window.ani.adobecanvas);
      window.stage = window.ani.stage;
      //Registers the "tick" event listener.
      let fnStartAnimation = function() {
        window.ani.stage.addChild(window.ani.exportRoot);
        //by default ticker uses setTimeout API, force to use requestAnimationFrame API
        window.createjs.Ticker.timingMode = window.createjs.Ticker.RAF_SYNCHED;
        window.createjs.Ticker.framerate = window.ani.lib.properties.fps;
        window.createjs.Ticker.addEventListener('tick', window.ani.stage);
      };
      //Code to support hidpi screens and responsive scaling.
      window.AdobeAn.makeResponsive(false, 'both', true, 2, [window.ani.adobecanvas, window.ani.anim_container, window.ani.dom_overlay_container]);
      window.AdobeAn.compositionLoaded(window.ani.lib.properties.id);
      fnStartAnimation();
      setTimeout(()=>{
        //get all objects from animation
        window.ani.objs = Object.keys(window.ani.exportRoot.children[0]);
        //filter objects by purpose - so it can be bind to model value
        window.ani.animobjs = window.ani.objs.filter(name => name.endsWith('_anim'));
        window.ani.textobjs = window.ani.objs.filter(name => name.endsWith('_text'));
        window.ani.playobjs = window.ani.objs.filter(name => name.endsWith('_play'));
        window.ani.stopAllAnimation();
      }, 1000);
    }

    /**
     * starts animation of particular object
     * @param objname
     */
    startAnimation(objname) {
      if (this.exportRoot && this.exportRoot.children[0][objname]) {
        this.exportRoot.children[0][objname].play();
      }
      //this.timeline.addTween(cjs.Tween.get(this.instance).to({alpha:1},159).wait(1));
    }

    /**
     * stops animation of particular object
     * @param objname
     */
    stopAnimation(objname) {
      if (this.exportRoot && this.exportRoot.children[0][objname]) {
        this.exportRoot.children[0][objname].stop();
      }
    }

    /**
     * set the animation value of the object objname
     * @param objname
     * @param value
     */

    setAnimationValue(objname, value) {
      //console.log('adobe-animate() setting window.ani.exportRoot.children[0][' + objname + '].gotoAndStop(' + value + ')');
      if (window.ani.exportRoot) {
        //resolve path from string
        const resolvePath = (object, path, defaultValue) => path
          .split('.')
          .reduce((o, p) => o ? o[p] : defaultValue, object);
        let myobj = resolvePath(window.ani.exportRoot.children[0], objname, undefined);
        if (myobj) myobj.gotoAndStop(Math.floor(value));

        //window.ani.exportRoot.children[0][objname].gotoAndStop(value);
      }
    }

    /**
     * stops all animation
     */
    stopAllAnimation() {
      if (window.ani.stage) {
        window.ani.stage.stop();
      }
    }

    /**
     * starts all animation
     */
    startAllAnimation() {
      if (window.ani.stage) {
        window.ani.stage.play();
      }
    }

    /**
     * starts animation for 20 ms and stops it again
     */
    stepAllAnimation() {
      if (window.ani.stage) {
        window.ani.stage.play();
        setTimeout(()=>{window.ani.stage.stop();}, 20);
      }
    }

    /**
     * Sets text content of object in Adobe Animate
     * @param objname
     * @param textvalue
     */
    setText(objname, textvalue) {
      if (window.ani.exportRoot) {
        window.ani.exportRoot.children[0][objname].text = textvalue;
      }
    }

    /**
     * Uses values in e.detail.data and converts them to animation values
     * @param e
     */
    handleData(e) {
      let bindings = window.animatebindings;
      if (!bindings) return;
      for (let binding of bindings) {
        //binding = {findex:findex,aname:aname,amin:amin,amax:amax,fmin:fmin,fmax:fmax}
        let value = e.detail.data[binding.findex];
        if (binding.aname.endsWith('_text')) {
          this.setText(binding.aname, value);
        } else
        if (binding.aname.endsWith('_anim')) {
          let convertedvalue = binding.convertf2a(value);
          this.setAnimationValue(binding.aname, convertedvalue);
        }
      }
    }
}
