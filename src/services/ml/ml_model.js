import * as tf from '@tensorflow/tfjs';

/**
 * PricePredictor - Browser-side Neural Network for Price Direction Prediction
 */
export class PricePredictor {
    constructor() {
        this.model = null;
        this.isTraining = false;
    }

    /**
     * Build the Neural Network architecture (v2 Regression)
     * Input: Normalized technical indicator values + Order Book Imbalance
     * Output: Predicted percentage change in price
     */
    createModel() {
        const model = tf.sequential();

        // Layer 1: Input & Hidden
        model.add(tf.layers.dense({
            inputShape: [5], // Features: normRSI, normMACD, normEMA_diff, normTrend, normOBI
            units: 16,
            activation: 'relu',
            kernelInitializer: 'leCunNormal'
        }));

        // Layer 2: Hidden (Added depth for regression complexity)
        model.add(tf.layers.dense({
            units: 12,
            activation: 'relu'
        }));

        model.add(tf.layers.dense({
            units: 8,
            activation: 'relu'
        }));

        // Layer 4: Output (Linear for regression)
        model.add(tf.layers.dense({
            units: 1,
            activation: 'linear'
        }));

        model.compile({
            optimizer: tf.train.adam(0.005), // Lowered LR for stability in regression
            loss: 'meanSquaredError',
            metrics: ['mse']
        });

        this.model = model;
        return model;
    }

    /**
     * Persist model to browser storage
     */
    async saveModel(id) {
        if (!this.model) return;
        try {
            await this.model.save(`indexeddb://spectrum-model-${id}`);
            // console.log(`Model ${id} saved to IndexedDB`);
        } catch (e) {
            console.warn('Model persistence failed:', e);
        }
    }

    /**
     * Load model from browser storage
     */
    async loadModel(id) {
        try {
            const model = await tf.loadLayersModel(`indexeddb://spectrum-model-${id}`);
            this.model = model;
            // console.log(`Model ${id} restored from IndexedDB`);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Prepares tensors from raw technical data
     */
    prepareTensors(features, labels = null) {
        return tf.tidy(() => {
            const featureTensor = tf.tensor2d(features, [features.length, 5]);

            if (labels) {
                const labelTensor = tf.tensor2d(labels, [labels.length, 1]);
                return { features: featureTensor, labels: labelTensor };
            }

            return { features: featureTensor };
        });
    }

    /**
     * Trains the model on historical klines
     */
    async train(features, labels, epochs = 20) {
        if (!this.model) this.createModel();
        if (this.isTraining) return;

        this.isTraining = true;
        const { features: xTrain, labels: yTrain } = this.prepareTensors(features, labels);

        try {
            await this.model.fit(xTrain, yTrain, {
                epochs,
                batchSize: 32,
                shuffle: true,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        // Keep training non-blocking for better UI
                        // console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
                    }
                }
            });
        } catch (err) {
            console.error('TF Training Error:', err);
        } finally {
            xTrain.dispose();
            yTrain.dispose();
            this.isTraining = false;
        }
    }

    /**
     * Predict price direction probability
     */
    async predict(featureRow) {
        if (!this.model) return 0;

        return tf.tidy(() => {
            const input = tf.tensor2d([featureRow], [1, 5]);
            const prediction = this.model.predict(input);
            return prediction.dataSync()[0];
        });
    }
}

// Singleton instances for different timeframes/horizons if needed
const instances = {};

export function getPredictor(id) {
    if (!instances[id]) instances[id] = new PricePredictor();
    return instances[id];
}
