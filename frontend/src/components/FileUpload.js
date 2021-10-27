import React from 'react';
import ContinueButton from './ContinueButton';

function FileUpload(props){
    return(
        <div>
            <input type="file" name="file" onChange={props.selectFile}/>
            	{props.isSelected ? (
				<div>
					<p>Filename: {props.selectedFile.name}</p>
					<p>Filetype: {props.selectedFile.type}</p>
					<p>Size in bytes: {props.selectedFile.size}</p>
				</div>
			) : (
				<p>Select a CSV file to transform</p>
			)}
            <label>
                <input type="checkbox" name="hasHeader" checked={props.hasHeader} onChange={props.handleCheckboxChange} />
                CSV has header row
            </label>
            
            <div>
                <ContinueButton handleSubmission={props.uploadFile} />
            </div>
        </div>
    )
}

export default FileUpload;