/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
'use strict';

import testUtils from '../testUtils/testUtils.js';
/* jasmine specs for controllers go here */
describe('Concept dictionary controllers', function() {

    beforeEach(function(){
        jasmine.addMatchers({
            toEqualData: function(util, customEqualityTesters) {
                return {
                    compare: function(actual, expected) {
                        var passed = angular.equals(actual, expected);
                        return {
                            pass: passed,
                            message: 'Expected ' + actual + (passed ? '' : ' not') + ' to equal ' + expected
                        }
                    }
                }
            }
        });
    });

    beforeEach(angular.mock.module('conceptDictionaryApp'));

    describe('DrugEditController', function(){
        var scope, ctrl, $httpBackend, $locationMock, notificationMock;
        $locationMock = testUtils.getLocationMock();
        notificationMock = testUtils.getNotificationMock();

        beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, openmrsRest){
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('manifest.webapp').respond(500, "");
			$httpBackend.whenGET(/translation.*/).respond();
            $httpBackend.whenGET('/ws/rest/v1/drug/2b22dc27-72ec-4ab5-9fa8-d98be91adc1c?v=full').
            respond({ name: 'Morphine', 
            		strength: 'high', 
            		uuid: "2b22dc27-72ec-4ab5-9fa8-d98be91adc1c"});   

            scope = $rootScope.$new();
            
            var loadDrug;
            openmrsRest.getFull('drug', {uuid: "2b22dc27-72ec-4ab5-9fa8-d98be91adc1c"}).then(function(response){
            	loadDrug = response;
            });


            $httpBackend.flush();

            ctrl = $controller('DrugEditController', 
            		{$scope: scope, loadDrug: loadDrug, $location: $locationMock, openmrsNotification: notificationMock});

        }));

        it('Should load one drug', function(){
            expect(ctrl.drug).toEqualData({ name: 'Morphine',
													strength: 'high', 
													uuid: "2b22dc27-72ec-4ab5-9fa8-d98be91adc1c"});
        });
        it('Should save edited drug', function(){
            $httpBackend.expectPOST('/ws/rest/v1/drug/2b22dc27-72ec-4ab5-9fa8-d98be91adc1c').
            respond({ name: 'Morphine', 
            		strength: 'high', 
            		uuid: "2b22dc27-72ec-4ab5-9fa8-d98be91adc1c"}); 
            
        	ctrl.drug.name = "Morphine";
			ctrl.drug.concept = "3g65dc27-72ec-4ab5-9fa8-d98be91adb5b";
			ctrl.drug.strength = "high";
			ctrl.drug.combination = true;
			ctrl.drug.retired = "false";
			ctrl.drug.route = "123";
			ctrl.drug.dosageForm = "234";
			
			ctrl.saveDrug();			
			$httpBackend.flush();
            expect($locationMock.path).toHaveBeenCalledWith('/drug');
            expect($locationMock.search).toHaveBeenCalledWith({successToast: "Morphine has been saved"});
        });
        it('Should fail saving edited drug', function(){
            var errorMsg = "ERROR MSG"
            $httpBackend.expectPOST('/ws/rest/v1/drug/2b22dc27-72ec-4ab5-9fa8-d98be91adc1c').respond(500, {"error" : {"message" : errorMsg }});
            
        	ctrl.drug.name = "Morphine";
			ctrl.drug.concept = "3g65dc27-72ec-4ab5-9fa8-d98be91adb5b";
			ctrl.drug.strength = "high";
			ctrl.drug.combination = true;
			ctrl.drug.retired = "false";
			ctrl.drug.route = "123";
			ctrl.drug.dosageForm = "234";
			
            ctrl.saveDrug();
            $httpBackend.flush();
            expect(notificationMock.error).toHaveBeenCalledWith(errorMsg);
        });

    });
});