/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
	
	config.language='zh-cn';
	config.title=false;
		
	config.toolbar =[
				['Undo','Redo'],
				['Bold','Italic','Underline','Strike','TextColor','BGColor'],
				['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
				['Link','Unlink'],
				['Image'],
				'/',
				['Format','Font','FontSize'],
				
		];

	
	config.colorButton_enableMore = true;

	config.removeDialogTabs = 'image:advanced;link:advanced';
	
	config.forcePasteAsPlainText  = true;
	
	
	
};
