'use strict';
import {Jovo} from "./Jovo";
const _sample = require('lodash.sample');

/** Class SpeechBuilder */
export class SpeechBuilder {
    speech = '';
    jovo: Jovo | undefined;

    static ESCAPE_AMPERSAND = true;
    /**
     * Constructor
     * @param {Jovo=} jovo instance
     * @public
     */
    constructor(jovo?: Jovo) {
        this.jovo = jovo;
    }

    /**
     * Adds text surrounded by <s> tags
     * @param {string} text
     * @param {boolean} condition
     * @param {number} probability
     * @return {SpeechBuilder}
     */
    addSentence(text: string | string[], condition?: boolean, probability?: number): this {
        if (Array.isArray(text)) {
            return this.addText('<s>' + _sample(text) + '</s>', condition, probability);
        }
        return this.addText('<s>' + text + '</s>', condition, probability);
    }

    /**
     * Adds <say-as> tags with interpret-as cardinal
     * @param {string} n
     * @param {boolean} condition
     * @param {number} probability
     * @return {SpeechBuilder}
     */
    addSayAsCardinal(n: number | number[], condition?: boolean, probability?: number): this {
        if (Array.isArray(n)) {
            return this.addText('<say-as interpret-as="cardinal">'+ _sample(n) +'</say-as>', condition, probability);
        }
        return this.addText('<say-as interpret-as="cardinal">'+n+'</say-as>', condition, probability);
    }

    /**
     * Adds <say-as> tags with interpret-as ordinal
     * @param {string} n
     * @param {boolean} condition
     * @param {number} probability
     * @return {SpeechBuilder}
     */
    addCardinal(n: number | number[], condition?: boolean, probability?: number): this {
        return this.addSayAsCardinal(n, condition, probability);
    }

    /**
     * Adds <say-as> tags with interpret-as ordinal
     * @param {string} n
     * @param {boolean} condition
     * @param {number} probability
     * @return {SpeechBuilder}
     */
    addSayAsOrdinal(n: number | number[], condition?: boolean, probability?: number): this {
        if (Array.isArray(n)) {
            return this.addText('<say-as interpret-as="ordinal">'+ _sample(n) +'</say-as>', condition, probability);
        }
        return this.addText('<say-as interpret-as="ordinal">'+n+'</say-as>', condition, probability);
    }

    /**
     * Adds <say-as> tags with interpret-as ordinal
     * @param {string} n
     * @param {boolean} condition
     * @param {number} probability
     * @return {SpeechBuilder}
     */
    addOrdinal(n: number | number[], condition?: boolean, probability?: number): this {
        return this.addSayAsOrdinal(n, condition, probability);
    }

    /**
     * Adds <say-as> tags with interpret-as characters
     * @param {string} characters
     * @param {boolean} condition
     * @param {number} probability
     * @return {SpeechBuilder}
     */
    addSayAsCharacters(characters: string | string[], condition?: boolean, probability?: number): this {
        if (Array.isArray(characters)) {
            return this.addText('<say-as interpret-as="characters">'+_sample(characters)+'</say-as>', condition, probability);
        }
        return this.addText('<say-as interpret-as="characters">'+characters+'</say-as>', condition, probability);
    }

    /**
     * Adds <say-as> tags with interpret-as characters
     * @param {string} characters
     * @param {boolean} condition
     * @param {number} probability
     * @return {SpeechBuilder}
     */
    addCharacters(characters: string | string[], condition?: boolean, probability?: number): this {
        return this.addSayAsCharacters(characters, condition, probability);
    }

    /**
     * Adds break tag to speech obj
     * @public
     * @param {string} time timespan like 3s, 500ms etc
     * @param {boolean} condition
     * @param {number} probability
     * @return {SpeechBuilder}
     */
    addBreak(time: string | string[], condition?: boolean, probability?: number): this {
        const strengthValues = ['none', 'x-weak', 'weak', 'medium', 'strong', 'x-strong'];
        const breakTime = Array.isArray(time) ? _sample(time) : time;
        if (strengthValues.indexOf(breakTime) > -1) {
            return this.addText('<break strength="' + breakTime + '"/>', condition, probability);
        } else {
            return this.addText('<break time="' + breakTime + '"/>', condition, probability);
        }
    }
    /**
     * Adds text to speech
     * @public
     * @param {string} text
     * @param {boolean} condition
     * @param {number} probability
     * @return {SpeechBuilder}
     */
    addText(text: string | string[], condition?: boolean, probability?: number): this {
        if (typeof condition === "boolean" && condition === false) {
            return this;
        }
        if (typeof probability === "number") {
            if (Math.random() >= probability) {
                return this;
            }
        }
        if (this.speech.length > 0) {
            this.speech += ' ';
        }

        this.speech += Array.isArray(text) ? _sample(text) : text;
        return this;
    }

    /**
     * Adds phoneme tag to speech
     * @public
     * @param {string} text
     * @param {string} ph
     * @param {string} alphabet
     * @return {SpeechBuilder}
     */
    addPhoneme(text: string, ph: string, alphabet = 'ipa'): this {
        return this.addText(`<phoneme alphabet="${alphabet}" ph="${SpeechBuilder.escapeXml(ph)}">${text}</phoneme>`);
    }

    /**
     * Adds an x-sampa phoneme to speech
     * @public
     * @param {string} text
     * @param {string} ph
     * @return {SpeechBuilder}
     */
    addXSampa(text: string, ph: string): this {
        return this.addPhoneme(text, ph, 'x-sampa');
    }

    /**
     * Adds an ipa phoneme to speech
     * @public
     * @param {string} text
     * @param {string} ph
     * @return {SpeechBuilder}
     */
    addIpa(text: string, ph: string): this {
        return this.addPhoneme(text, ph, 'ipa');
    }

    /**
     * Returns speech object string
     * @deprecated use toString()
     * @public
     * @return {string}
     */
    build(): string {
        return this.speech;
    }

    /**
     * Returns SpeechBuilder as a string
     * @return {string}
     */
    toString(): string {
        return this.speech;
    }

    /**
     * Adds <speak> tags to a string. Replaces & with and (v1 compatibility)
     * @param {string} text
     * @returns {string}
     */
    static toSSML(text: string): string {
        text = text.replace(/<speak>/g, '').replace(/<\/speak>/g, '');
        text = '<speak>' + text + '</speak>';

        if (SpeechBuilder.ESCAPE_AMPERSAND) { // workaround (v1 compatibility)
            text = text.replace(/&/g, 'and');
        }

        return text;
    }

    /**
     * Removes everything that is surrounded by <>
     * @param {string} ssml
     * @returns {string}
     */
    static removeSSML(ssml: string): string {
        let noSSMLText = ssml.replace(/<speak>/g, '').replace(/<\/speak>/g, '');
        noSSMLText = noSSMLText.replace(/<[^>]*>/g, '');
        return noSSMLText;
    }

    /**
     * Removes <speak> tags from string
     * @param {string} ssml
     * @returns {string}
     */
    static removeSpeakTags(ssml: string): string {
        return ssml.replace(/<speak>/g, '').replace(/<\/speak>/g, '');
    }

    /**
     * Escapes XML in SSML
     *
     * @see https://stackoverflow.com/questions/7918868/how-to-escape-xml-entities-in-javascript
     */
     static escapeXml(unsafe: string) {
        return unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                default:
                case '"': return '&quot;';
            }
        });
    }
}
