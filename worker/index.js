const { Worker } = require("worker_threads");

class ApiWorkerManager {
    #worker;
    #io;
    #data = [];

    createWorker(io) {
        return new Promise((resolve, reject) => {
            try {
                const worker = new Worker("./worker/worker.js");

                worker.on("message", async (data) => {
                    this.#data = JSON.parse(data);
                    console.log(this.#data);
                    this.#io.emit("cases", this.#data);
                });

                worker.on("error", error => {
                    console.log(error);
                });
                worker.on("exit", exitCode => {
                    console.log("Worker exit with code: " + exitCode);
                })

                this.#worker = worker;

                this.#io = io;

                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    sendData() {
        this.#io.emit("cases", this.#data);
    }
}

class Singleton {
    constructor() {
        throw new Error('Use Singleton.getInstance()');
    }
    static getInstance() {
        if (!Singleton.instance) {
            Singleton.instance = new ApiWorkerManager();
        }
        return Singleton.instance;
    }
}

module.exports = Singleton.getInstance();