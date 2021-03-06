
import {Db, PluginConfig, JovoError, ErrorCode} from 'jovo-core';
import * as path from 'path';
import * as fs from "fs";
import _set = require('lodash.set');
import _merge = require('lodash.merge');
import {BaseApp} from "jovo-core";

interface Config extends PluginConfig {
    path?: string;
}

export class FileDb2 implements Db {

    needsWriteFileAccess = true;
    config: Config = {
        path: './../db/',
    };

    constructor(config?: Config) {

        if (config) {
            this.config = _merge(this.config, config);
        }

    }

    install(app: BaseApp) {
        app.$db = this;

        this.errorHandling();

        if (!fs.existsSync(path.join(this.config.path!))) {
            FileDb2.mkDirByPathSync(path.join(this.config.path!), false);
        }
    }

    uninstall(app: BaseApp) {

    }

    errorHandling() {
        if (!this.config.path) {
            throw new JovoError(
                `Couldn't use FileDb2 plugin. path is missing`,
                ErrorCode.ERR_PLUGIN,
                'jovo-db-filedb',
                'config.path has a falsy value',
                undefined,
                'https://www.jovo.tech/docs/databases/file-db'
            );
        }
    }

    /**
     * Returns object for given primaryKey
     * @param {string} primaryKey
     * @return {Promise<any>}
     */
    async load(primaryKey: string) {
        this.errorHandling();

        const pathToFile = path.join(this.config.path!, `${primaryKey}.json`);
        if (!fs.existsSync(pathToFile)) {
            return Promise.resolve(undefined);
        }

        const data: any = await this.readFile(pathToFile); // tslint:disable-line

        return Promise.resolve(JSON.parse(data));
    }

    async save(primaryKey: string, key: string, data: any) { // tslint:disable-line
        this.errorHandling();

        const pathToFile = path.join(this.config.path!, `${primaryKey}.json`);
        if (fs.existsSync(pathToFile)) {
            const oldDataContent = await this.readFile(pathToFile);
            const oldData = JSON.parse(oldDataContent);
            _set(oldData, key, data);
            return await this.saveFile(pathToFile, oldData);
        } else {
            const newData: any = {}; // tslint:disable-line
            _set(newData, key, data);
            return await this.saveFile(pathToFile, newData);
        }
    }

    async delete(primaryKey: string) {
        this.errorHandling();

        const pathToFile = path.join(this.config.path!, `${primaryKey}.json`);

        return await this.deleteFile(pathToFile);
    }


    private async readFile(filename: string) {
        return new Promise<any>((resolve, reject) => { // tslint:disable-line
            fs.readFile(filename, 'utf8', (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    }

    private async saveFile(filename: string, data: any) { // tslint:disable-line
        return new Promise<any>((resolve, reject) => { // tslint:disable-line
            fs.writeFile(filename, JSON.stringify(data, null, '\t'), (err) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                resolve();
            });
        });
    }

    private async deleteFile(filename: string) {
        return new Promise<any>((resolve, reject) => { // tslint:disable-line
            fs.unlink(filename, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    /**
     * Creates paths recursively
     * @param {string} targetDir
     * @param {boolean} isRelativeToScript
     */
    private static mkDirByPathSync(targetDir: string, isRelativeToScript: boolean) {
        const sep = path.sep;
        const initDir = path.isAbsolute(targetDir) ? sep : '';
        const baseDir = isRelativeToScript ? __dirname : '.';

        targetDir.split(sep).reduce((parentDir, childDir) => {
            const curDir = path.resolve(baseDir, parentDir, childDir);
            try {
                if (!fs.existsSync(curDir)) {
                    fs.mkdirSync(curDir);
                    console.log(`Directory ${curDir} created!`);
                }
            } catch (err) {
                if (err.code !== 'EEXIST') {
                    throw err;
                }

                console.log(`Directory ${curDir} already exists!`);
            }

            return curDir;
        }, initDir);
    }

}
