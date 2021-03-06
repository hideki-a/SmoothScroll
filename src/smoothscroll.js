/*
 * Smooth Scroll
 * Version 1.0.6
 * Copyright (c) 2013 Hideki Abe
 *
 * Licensed under the MIT.
 */
/*jslint browser: true, eqeq: false, nomen: true, plusplus: false, maxerr: 100, indent: 4 */
(function (window, document) {
    "use strict";
    var stack = [];
    window.requestAnimationFrame = window.requestAnimationFrame || 
                                    window.webkitRequestAnimationFrame || 
                                    function (callback) {
                                        window.setTimeout(callback, 17);
                                    };

    function addEvent(elem, type, listener, useCapture) {
        if (elem.addEventListener) {
            elem.addEventListener(type, listener, useCapture);
        } else if (elem.attachEvent) {
            elem.attachEvent("on" + type, listener);
        }
        if (type !== "unload") {
            stack.push([elem, type, listener, useCapture]);
        }
    }

    function removeEvent(elem, type, listener, useCapture) {
        if (elem.removeEventListener) {
            elem.removeEventListener(type, listener, useCapture);
        } else if (elem.dettachEvent) {
            elem.detachEvent("on" + type, listener);
        }
    }

    function proxy(obj, fn) {
        return function () {
            fn.apply(obj, arguments);
        };
    }

    function SmoothScroll(elem, options) {
        this.elem = elem;
        this.targetId = null;
        this.targetElem = null;
        this.start = 0;
        this.dest = 0;
        this.direction = null;
        this.options = {
            excludeCond: /tab_/,
            v: 20    // The value which influences speed.
        };
        SmoothScroll.prototype.setOptions.call(this, options);
    }

    SmoothScroll.prototype = {
        setOptions: function (options) {
            var opt;
            for (opt in options) {
                if (options.hasOwnProperty(opt)) {
                    this.options[opt] = options[opt];
                }
            }
        },

        init: function () {
            this.targetId = this.elem.getAttribute("href").replace(/(https?:\/\/[a-zA-Z0-9\.%\/]+)?\#/, "");
            this.targetElem = document.getElementById(this.targetId);
            if (!this.options.excludeCond.test(this.targetId) && this.targetElem) {
                addEvent(this.elem, "click", proxy(this, function (e) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else if (typeof window.attachEvent === "object") {
                        event.returnValue = false;
                    }
                    this.startScroll();
                }), false);
            }
        },

        startScroll: function () {
            var documentHeight = document.documentElement.scrollHeight,
                viewportHeight = document.documentElement.clientHeight;
            this.start = window.pageYOffset || document.documentElement.scrollTop;
            this.dest = this.targetElem.offsetTop;
            if (documentHeight - viewportHeight < this.dest) {
                this.dest = documentHeight - viewportHeight;
            } else if (this.dest === 0) {
                this.dest = 1;
            }
            this.direction = (this.dest - this.start > 0) ? "down" : "up";
            this.doScroll();
        },

        doScroll: function () {
            var moveY;
            if (this.direction === "up" && this.start > this.dest) {
                moveY = Math.floor(this.start - (this.start - this.dest) / this.options.v - 1);
                if (moveY <= 1) {
                    moveY = 1;
                }
            } else if (this.direction === "down" && this.dest > this.start) {
                moveY = Math.ceil(this.start + (this.dest - this.start) / this.options.v + 1);
            } else {
                return;
            }
            window.scrollTo(0, moveY);
            this.start = moveY;
            window.requestAnimationFrame(proxy(this, this.doScroll));
        }
    };

    addEvent(window, "load", function () {
        var instances = [],
            anchors = document.getElementsByTagName("a"),
            nAnchor = anchors.length,
            i,
            href;
        for (i = 0; i < nAnchor; i += 1) {
            href = anchors[i].getAttribute("href");
            if (/\#[a-zA-Z0-9\-_]+$/.test(href)) {
                instances[i] = new SmoothScroll(anchors[i]);
                instances[i].init();
            }
        }
    }, false);

    addEvent(window, "unload", function () {
        var s,
            nStack = stack.length;
        for (s = 0; s < nStack; s += 1) {
            removeEvent.apply(window.Event, stack[s]);
        }
    }, false);
}(window, document));
