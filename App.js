import React, {useCallback, useEffect, useRef} from 'react';
import {StyleSheet, View, PanResponder, Button} from 'react-native';
import {Canvas, MobileModel, torch, Module} from 'react-native-pytorch-core';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import * as RNFS from "react-native-fs";
import DrawingComponent from "./DrawingComponent";

export default function App() {
    const model = useRef(null)

    useEffect( () => {
        loadModel().then()
    },[])


    const loadModel = async () => {
        if (model.current !== null) {
            return
        }

        try {
            const path = resolveAssetSource(require('./assets/models/classify_image.ptl'))

            const downloadDest = `${RNFS.DocumentDirectoryPath}/classify_image.ptl`;
            const result = await RNFS.downloadFile({
                fromUrl: path.uri,
                toFile: downloadDest,
            }).promise;

            if (result.statusCode !== 200) {
                throw new Error('Failed to download asset');
            }

            model.current = await torch.jit._loadForMobile(downloadDest, "cpu");
            console.log("successfully loaded model")
        } catch (err) {
            console.error(err)
        }
    }

    async function predict() {
        const inputSize = 784
        const inputTensor = torch.randn([1, inputSize]);

        let outputTensor = await model.current.forward(inputTensor);
        outputTensor = outputTensor.softmax(-1)

        const outputData = Array.from(outputTensor.data());

        const predictedClass = outputData.indexOf(Math.max(...outputData));

        console.log("Predicted class:", predictedClass);
    }

    return (
        <DrawingComponent loadModelAndPredict={predict} />
    );
}
