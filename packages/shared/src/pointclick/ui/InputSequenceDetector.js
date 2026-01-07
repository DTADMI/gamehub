export class InputSequenceDetector {
    sequence = [];
    maxSequenceLength;
    onSequenceMatched;
    targetSequence;
    constructor(targetSequence, onMatched) {
        this.targetSequence = targetSequence;
        this.maxSequenceLength = targetSequence.length;
        this.onSequenceMatched = onMatched;
    }
    processInput(event) {
        // Add the new input to the sequence
        this.sequence.push(event.type);
        // Keep only the last N inputs
        if (this.sequence.length > this.maxSequenceLength) {
            this.sequence.shift();
        }
        // Check if the sequence matches
        if (this.sequence.length === this.targetSequence.length) {
            let match = true;
            for (let i = 0; i < this.targetSequence.length; i++) {
                if (this.sequence[i] !== this.targetSequence[i]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                this.onSequenceMatched([...this.sequence]);
                this.sequence = []; // Reset after match
            }
        }
    }
    reset() {
        this.sequence = [];
    }
}
